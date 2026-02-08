from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class ProductLogAction(str, enum.Enum):
    WITHDRAWAL = "Entnahme"
    RETURN = "Rückgabe"
    INCOMING = "Eingang"
    CORRECTION = "Korrektur"
    INVENTORY = "Inventur"
    SALE = "Verkauf"

class ProductLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"))
    product_name = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    user_name = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projekt.id"), nullable=True)
    project_number = Column(String, nullable=True)
    action = Column(String, default=ProductLogAction.WITHDRAWAL)
    quantity = Column(Float, default=0.0)
    note = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
    user = relationship("User")
    project = relationship("Projekt")
