from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from app.schemas.user import User
from app.schemas.subcontractor import Subcontractor

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "Geplant"
    priority: Optional[str] = "Mittel"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    projekt_nummer: Optional[str] = None
    budget: Optional[float] = 0.0
    address: Optional[str] = None
    main_image: Optional[str] = None
    photos: Optional[List[str]] = []
    files: Optional[List[dict]] = [] # List of {name, url}
    
    customer_id: Optional[int] = None
    category_id: Optional[int] = None
    projektleiter_id: Optional[int] = None

class ProjectCreate(ProjectBase):
    gruppenleiter_ids: Optional[List[int]] = []
    worker_ids: Optional[List[int]] = []
    subcontractor_ids: Optional[List[int]] = []

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    gruppenleiter_ids: Optional[List[int]] = None
    worker_ids: Optional[List[int]] = None
    subcontractor_ids: Optional[List[int]] = None

class ProjectInDBBase(ProjectBase):
    id: int
    
    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    projektleiter: Optional[User] = None
    gruppenleiter: List[User] = []
    workers: List[User] = []
    subcontractors: List[Subcontractor] = []

class ProjectPublic(ProjectBase):
    id: int
    # Simplified public view
    class Config:
        from_attributes = True
