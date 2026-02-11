from sqlalchemy import Column, Integer, String, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class CategoryType(str, enum.Enum):
    PROJECT = "Projekt"
    WARE = "Ware"

class Category(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey('category.id'), nullable=True)
    type = Column(String, default=CategoryType.PROJECT) # Storing as string for flexibility
    color = Column(String, nullable=True)
    icon_name = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    
    # New fields
    label = Column(String, nullable=True) # Zusatzbeschriftung
    modal_config = Column(JSON, nullable=True) # Configuration for the service modal

    # Dynamic fields definition
    custom_fields = Column(JSON, nullable=True)

    parent = relationship("Category", remote_side=[id], backref="children")
    projects = relationship("Projekt", back_populates="category")
