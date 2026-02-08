from typing import Optional
from pydantic import BaseModel

class SubcontractorBase(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    city: Optional[str] = None
    specialization: Optional[str] = None
    status: Optional[str] = "Aktiv"
    notes: Optional[str] = None
    hourly_rate: Optional[float] = None

class SubcontractorCreate(SubcontractorBase):
    pass

class SubcontractorUpdate(SubcontractorBase):
    pass

class Subcontractor(SubcontractorBase):
    id: int

    class Config:
        from_attributes = True
