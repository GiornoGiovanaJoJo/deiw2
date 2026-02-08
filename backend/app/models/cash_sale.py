from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class SaleStatus(str, enum.Enum):
    PROCESSED = "Обработана"
    PENDING = "Ожидание"
    ERROR = "Ошибка"

class CashSale(Base):
    id = Column(Integer, primary_key=True, index=True)
    cash_register_id = Column(Integer, ForeignKey("cashregister.id"))
    cash_register_name = Column(String, nullable=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=True)
    product_name = Column(String, nullable=True)
    quantity = Column(Float, default=1.0)
    amount = Column(Float, default=0.0)
    sale_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default=SaleStatus.PROCESSED)
    stock_reduced = Column(Boolean, default=False)
    restock_needed = Column(Boolean, default=False)

    cash_register = relationship("CashRegister")
    product = relationship("Product")
