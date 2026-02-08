from typing import Optional
from datetime import date
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "Geplant"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    projekt_nummer: Optional[str] = None

class ProjectCreate(ProjectBase):
    budget: Optional[float] = 0.0
    customer_id: Optional[int] = None
    category_id: Optional[int] = None

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    budget: Optional[float] = None
    customer_id: Optional[int] = None
    category_id: Optional[int] = None

class ProjectInDBBase(ProjectBase):
    id: int
    budget: Optional[float] = 0.0
    customer_id: Optional[int] = None
    category_id: Optional[int] = None

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    pass

class ProjectPublic(ProjectBase):
    id: int
    # Exclude budget and internal IDs for public view if desired, 
    # but based on previous errors/requirements, we'll keep basic info.
    # Adjust as needed. For now, public view might want to hide budget.
    class Config:
        from_attributes = True
