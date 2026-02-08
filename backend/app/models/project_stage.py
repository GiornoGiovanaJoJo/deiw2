from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class StageStatus(str, enum.Enum):
    PLANNED = "Geplant"
    IN_PROGRESS = "In Bearbeitung"
    COMPLETED = "Abgeschlossen"

class ProjectStage(Base):
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projekt.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    images = Column(JSON, default=list)
    status = Column(String, default=StageStatus.PLANNED)
    order = Column(Integer, default=0)

    project = relationship("Projekt", backref="stages")
