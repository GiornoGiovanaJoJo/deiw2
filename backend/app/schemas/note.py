from typing import Optional, List
from pydantic import BaseModel
from datetime import date

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    date: Optional[date] = None
    files: Optional[List[str]] = []
    user_id: int
    user_name: Optional[str] = None
    color: Optional[str] = "blau"
    is_important: bool = False

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class Note(NoteBase):
    id: int

    class Config:
        from_attributes = True
