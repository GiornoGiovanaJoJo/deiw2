from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class TaskPriority(str, enum.Enum):
    NIEDRIG = "Niedrig"
    MITTEL = "Mittel"
    HOCH = "Hoch"
    KRITISCH = "Kritisch"

class TaskStatus(str, enum.Enum):
    OFFEN = "Offen"
    IN_BEARBEITUNG = "In Bearbeitung"
    ERLEDIGT = "Erledigt"

class Aufgabe(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default=TaskStatus.OFFEN)
    priority = Column(String, default=TaskPriority.MITTEL)
    due_date = Column(Date, nullable=True)
    
    project_id = Column(Integer, ForeignKey("projekt.id"))
    assigned_to_id = Column(Integer, ForeignKey("user.id"), nullable=True)

    project = relationship("Projekt", back_populates="tasks")
    assigned_to = relationship("User", back_populates="tasks")
