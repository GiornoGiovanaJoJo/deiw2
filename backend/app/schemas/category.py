from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    type: Optional[str] = "Projekt"
    color: Optional[str] = None
    icon_name: Optional[str] = None
    image_url: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None

class CategoryInDBBase(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class Category(CategoryInDBBase):
    children: List['Category'] = []

Category.update_forward_refs()
