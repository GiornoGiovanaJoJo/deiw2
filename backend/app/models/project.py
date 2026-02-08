from sqlalchemy import Column, Integer, String, Date, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.customer import Customer # noqa: F401
from app.models.category import Category # noqa: F401
import enum

class ProjectStatus(str, enum.Enum):
    GEPLANT = "Geplant"
    IN_BEARBEITUNG = "In Bearbeitung"
    ABGESCHLOSSEN = "Abgeschlossen"
    PAUSIERT = "Pausiert"
    STORNIERT = "Storniert"

class Projekt(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default=ProjectStatus.GEPLANT)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget = Column(Float, default=0.0)
    projekt_nummer = Column(String, unique=True, index=True, nullable=True)
    
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)

    tasks = relationship("Aufgabe", back_populates="project")
    customer = relationship("Customer", back_populates="projects")
    category = relationship("Category", back_populates="projects")

