from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.subcontractor import Subcontractor
from app.schemas.subcontractor import Subcontractor as SubcontractorSchema, SubcontractorCreate, SubcontractorUpdate

router = APIRouter()

@router.get("/", response_model=List[SubcontractorSchema])
def read_subcontractors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(Subcontractor).offset(skip).limit(limit).all()

@router.post("/", response_model=SubcontractorSchema)
def create_subcontractor(
    *,
    db: Session = Depends(deps.get_db),
    sub_in: SubcontractorCreate,
) -> Any:
    sub = Subcontractor(**sub_in.dict())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.put("/{id}", response_model=SubcontractorSchema)
def update_subcontractor(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    sub_in: SubcontractorUpdate,
) -> Any:
    sub = db.query(Subcontractor).filter(Subcontractor.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontractor not found")
    update_data = sub_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sub, field, value)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub
