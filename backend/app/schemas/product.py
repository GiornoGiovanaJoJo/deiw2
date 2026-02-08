from typing import Optional
from pydantic import BaseModel
from .category import Category

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    unit: Optional[str] = "Stk"
    purchase_price: Optional[float] = None
    sales_price: Optional[float] = None
    stock: Optional[float] = 0.0
    min_stock: Optional[float] = 0.0
    location: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = "Verfügbar"

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True
