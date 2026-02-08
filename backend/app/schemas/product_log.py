from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ProductLogBase(BaseModel):
    product_id: int
    product_name: Optional[str] = None
    user_id: int
    user_name: Optional[str] = None
    project_id: Optional[int] = None
    project_number: Optional[str] = None
    action: str
    quantity: float
    note: Optional[str] = None

class ProductLogCreate(ProductLogBase):
    pass

class ProductLog(ProductLogBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
