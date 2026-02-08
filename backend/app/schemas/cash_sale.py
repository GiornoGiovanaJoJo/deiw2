from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CashSaleBase(BaseModel):
    cash_register_id: int
    cash_register_name: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: float = 1.0
    amount: float = 0.0
    status: Optional[str] = "Обработана"
    stock_reduced: bool = False
    restock_needed: bool = False

class CashSaleCreate(CashSaleBase):
    pass

class CashSale(CashSaleBase):
    id: int
    sale_date: datetime

    class Config:
        from_attributes = True
