from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.project import Projekt
from app.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectPublic
from app.models.user import User, UserRole
from app.models.subcontractor import Subcontractor
import re

router = APIRouter()

def generate_project_number(db: Session) -> str:
    """Generate the next project number in format EP-XXXX (starting from 1000)"""
    # Find the project with the highest number
    # We query all project numbers, parse them, find max, and increment
    # This is a simple implementation. For high concurrency, use a sequence or dedicated counter table.
    projects = db.query(Projekt.projekt_nummer).filter(Projekt.projekt_nummer.isnot(None)).all()
    max_num = 999
    
    for p in projects:
        if p.projekt_nummer and p.projekt_nummer.startswith("EP-"):
            try:
                num_part = int(p.projekt_nummer.split("-")[1])
                if num_part > max_num:
                    max_num = num_part
            except (IndexError, ValueError):
                continue
                
    return f"EP-{max_num + 1}"

@router.get("/stats", response_model=dict)
def read_project_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get project statistics.
    """
    total = db.query(Projekt).count()
    in_progress = db.query(Projekt).filter(Projekt.status == "In Bearbeitung").count()
    completed = db.query(Projekt).filter(Projekt.status == "Abgeschlossen").count()
    
    return {
        "total": total,
        "in_progress": in_progress,
        "completed": completed
    }

@router.get("/", response_model=List[Project])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve projects with role-based filtering.
    """
    query = db.query(Projekt)
    
    # Filter based on user role
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.OFFICE]:
        # See all projects
        pass
    elif current_user.role == UserRole.GROUP_LEADER:
        # See projects where they are group leader (M2M)
        query = query.filter(Projekt.gruppenleiter.any(id=current_user.id))
    elif current_user.role == UserRole.WORKER:
        # See projects where they are worker (M2M)
        query = query.filter(Projekt.workers.any(id=current_user.id))
    
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.get("/public", response_model=List[ProjectPublic])
def read_public_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve public projects.
    """
    projects = db.query(Projekt).offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=Project)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new project.
    """
    # Generate project number if not provided
    prom_num = project_in.projekt_nummer or generate_project_number(db)
    
    project = Projekt(
        name=project_in.name,
        description=project_in.description,
        status=project_in.status,
        priority=project_in.priority,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        budget=project_in.budget,
        projekt_nummer=prom_num,
        address=project_in.address,
        photos=project_in.photos,
        customer_id=project_in.customer_id,
        category_id=project_in.category_id,
        projektleiter_id=project_in.projektleiter_id
    )
    
    # Handle M2M relationships
    if project_in.gruppenleiter_ids:
        users = db.query(User).filter(User.id.in_(project_in.gruppenleiter_ids)).all()
        project.gruppenleiter = users
        
    if project_in.worker_ids:
        users = db.query(User).filter(User.id.in_(project_in.worker_ids)).all()
        project.workers = users
        
    if project_in.subcontractor_ids:
        subs = db.query(Subcontractor).filter(Subcontractor.id.in_(project_in.subcontractor_ids)).all()
        project.subcontractors = subs
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{project_id}", response_model=Project)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a project.
    """
    project = db.query(Projekt).filter(Projekt.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_in.model_dump(exclude_unset=True)
    
    # Handle M2M updates if present
    if 'gruppenleiter_ids' in update_data:
        ids = update_data.pop('gruppenleiter_ids')
        if ids is not None:
             project.gruppenleiter = db.query(User).filter(User.id.in_(ids)).all()
             
    if 'worker_ids' in update_data:
        ids = update_data.pop('worker_ids')
        if ids is not None:
            project.workers = db.query(User).filter(User.id.in_(ids)).all()
            
    if 'subcontractor_ids' in update_data:
        ids = update_data.pop('subcontractor_ids')
        if ids is not None:
             project.subcontractors = db.query(Subcontractor).filter(Subcontractor.id.in_(ids)).all()

    for field, value in update_data.items():
        if hasattr(project, field):
            setattr(project, field, value)
        
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=Project)
def read_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get project by ID.
    """
    project = db.query(Projekt).filter(Projekt.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Simple access control check (optional, refining the filter approach)
    # The list endpoint filters, but direct access by ID might also need checks if strict isolation required.
    # For now, assuming if they have the ID and are authenticated, basic read is ok, 
    # but strictly speaking should check role here too if isolating.
    
    return project

@router.delete("/{project_id}", response_model=Project)
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a project.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to delete projects")

    project = db.query(Projekt).filter(Projekt.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return project

@router.get("/public/{project_id}", response_model=ProjectPublic)
def read_public_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
) -> Any:
    """
    Get public project by ID.
    """
    project = db.query(Projekt).filter(Projekt.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
