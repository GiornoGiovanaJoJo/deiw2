from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.project_stage import ProjectStage
from app.schemas.project_stage import ProjectStage as ProjectStageSchema, ProjectStageCreate, ProjectStageUpdate

router = APIRouter()

@router.get("/", response_model=List[ProjectStageSchema])
def read_project_stages(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
) -> Any:
    query = db.query(ProjectStage)
    if project_id:
        query = query.filter(ProjectStage.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ProjectStageSchema)
def create_project_stage(
    *,
    db: Session = Depends(deps.get_db),
    stage_in: ProjectStageCreate,
) -> Any:
    stage = ProjectStage(**stage_in.dict())
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage

@router.put("/{id}", response_model=ProjectStageSchema)
def update_project_stage(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    stage_in: ProjectStageUpdate,
) -> Any:
    stage = db.query(ProjectStage).filter(ProjectStage.id == id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Project stage not found")
    update_data = stage_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stage, field, value)
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage
