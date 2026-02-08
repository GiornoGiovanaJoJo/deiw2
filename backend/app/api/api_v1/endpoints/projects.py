from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.project import Projekt
from app.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectPublic
from app.models.user import User

router = APIRouter()

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
    Retrieve projects.
    """
    projects = db.query(Projekt).offset(skip).limit(limit).all()
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
    project = Projekt(
        name=project_in.name,
        description=project_in.description,
        status=project_in.status,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        budget=project_in.budget,
        projekt_nummer=project_in.projekt_nummer,
    )
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
    for field, value in update_data.items():
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
