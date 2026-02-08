from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.note import Note
from app.schemas.note import Note as NoteSchema, NoteCreate, NoteUpdate

router = APIRouter()

@router.get("/", response_model=List[NoteSchema])
def read_notes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
) -> Any:
    query = db.query(Note)
    if user_id:
        query = query.filter(Note.user_id == user_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=NoteSchema)
def create_note(
    *,
    db: Session = Depends(deps.get_db),
    note_in: NoteCreate,
) -> Any:
    note = Note(**note_in.dict())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.put("/{id}", response_model=NoteSchema)
def update_note(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    note_in: NoteUpdate,
) -> Any:
    note = db.query(Note).filter(Note.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    update_data = note_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
