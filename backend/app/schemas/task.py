from typing import Optional
from datetime import date
from pydantic import BaseModel

class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Offen"
    priority: Optional[str] = "Mittel"
    due_date: Optional[date] = None
    project_id: Optional[int] = None
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    title: str
    project_id: int

class TaskUpdate(TaskBase):
    pass

class TaskInDBBase(TaskBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

class Task(TaskInDBBase):
    pass
