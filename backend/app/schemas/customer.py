from typing import Optional
from pydantic import BaseModel

class CustomerBase(BaseModel):
    type: Optional[str] = "Firma"
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "Aktiv"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerInDBBase(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class Customer(CustomerInDBBase):
    pass
