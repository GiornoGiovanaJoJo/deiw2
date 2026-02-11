from sqlalchemy import Column, Integer, String, Date, Float, Enum, ForeignKey, Table, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.customer import Customer # noqa: F401
from app.models.category import Category # noqa: F401
from app.models.user import User # noqa: F401
from app.models.subcontractor import Subcontractor # noqa: F401
import enum

# Association tables
project_gruppenleiter = Table(
    'project_gruppenleiter',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projekt.id')),
    Column('user_id', Integer, ForeignKey('user.id'))
)

project_worker = Table(
    'project_worker',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projekt.id')),
    Column('user_id', Integer, ForeignKey('user.id'))
)

project_subcontractor = Table(
    'project_subcontractor',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projekt.id')),
    Column('subcontractor_id', Integer, ForeignKey('subcontractor.id'))
)

class ProjectStatus(str, enum.Enum):
    GEPLANT = "Geplant"
    IN_BEARBEITUNG = "In Bearbeitung"
    ABGESCHLOSSEN = "Abgeschlossen"
    PAUSIERT = "Pausiert"
    STORNIERT = "Storniert"

class ProjectPriority(str, enum.Enum):
    NIEDRIG = "Niedrig"
    MITTEL = "Mittel"
    HOCH = "Hoch"
    KRITISCH = "Kritisch"

class Projekt(Base):
    id = Column(Integer, primary_key=True, index=True)
    projekt_nummer = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default=ProjectStatus.GEPLANT)
    priority = Column(String, default=ProjectPriority.MITTEL)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget = Column(Float, default=0.0)
    address = Column(String, nullable=True)
    main_image = Column(String, nullable=True) # Main featured image
    photos = Column(JSON, default=list) # List of additional image URLs (Gallery)
    files = Column(JSON, default=list) # List of file objects {name, url, type}
    
    # Foreign Keys
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    projektleiter_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="projects")
    category = relationship("Category", back_populates="projects")
    tasks = relationship("Aufgabe", back_populates="project")
    
    projektleiter = relationship("User", foreign_keys=[projektleiter_id], backref="managed_projects")
    gruppenleiter = relationship("User", secondary=project_gruppenleiter, backref="group_projects")
    workers = relationship("User", secondary=project_worker, backref="worker_projects")
    subcontractors = relationship("Subcontractor", secondary=project_subcontractor, backref="projects")

