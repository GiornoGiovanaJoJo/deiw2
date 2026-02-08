from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.time_entry import TimeEntry
from app.schemas.time_entry import TimeEntry as TimeEntrySchema, TimeEntryCreate, TimeEntryUpdate

router = APIRouter()

@router.get("/", response_model=List[TimeEntrySchema])
def read_time_entries(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(TimeEntry).offset(skip).limit(limit).all()

@router.post("/", response_model=TimeEntrySchema)
def create_time_entry(
    *,
    db: Session = Depends(deps.get_db),
    entry_in: TimeEntryCreate,
) -> Any:
    entry = TimeEntry(**entry_in.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.put("/{id}", response_model=TimeEntrySchema)
def update_time_entry(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    entry_in: TimeEntryUpdate,
) -> Any:
    entry = db.query(TimeEntry).filter(TimeEntry.id == id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    update_data = entry_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
