from sqlalchemy import Column, Integer, String, Float, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class ProductStatus(str, enum.Enum):
    AVAILABLE = "Verfügbar"
    LOW_STOCK = "Niedrig"
    OUT_OF_STOCK = "Ausverkauft"

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    barcode = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    unit = Column(String, default="Stk")
    purchase_price = Column(Float, nullable=True)
    sales_price = Column(Float, nullable=True)
    stock = Column(Float, default=0.0)
    min_stock = Column(Float, default=0.0)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default=ProductStatus.AVAILABLE)

    category = relationship("Category", backref="products")
