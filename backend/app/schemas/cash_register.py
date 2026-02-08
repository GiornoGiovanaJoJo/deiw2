from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CashRegisterBase(BaseModel):
    name: str
    register_number: str
    api_key: Optional[str] = None
    status: Optional[str] = "Не подключена"
    last_sync: Optional[datetime] = None
    description: Optional[str] = None
    address: Optional[str] = None

class CashRegisterCreate(CashRegisterBase):
    pass

class CashRegisterUpdate(CashRegisterBase):
    pass

class CashRegister(CashRegisterBase):
    id: int

    class Config:
        from_attributes = True
