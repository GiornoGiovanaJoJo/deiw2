from typing import Optional
from pydantic import BaseModel
from datetime import date

class TimeEntryBase(BaseModel):
    user_id: int
    user_name: Optional[str] = None
    date: date
    start_time: str
    end_time: Optional[str] = None
    hours: Optional[float] = None
    project_id: Optional[int] = None
    project_number: Optional[str] = None
    location: Optional[str] = "Büro"
    note: Optional[str] = None

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(TimeEntryBase):
    pass

class TimeEntry(TimeEntryBase):
    id: int

    class Config:
        from_attributes = True
