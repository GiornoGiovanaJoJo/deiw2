import enum
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class DocumentType(str, enum.Enum):
    PLAN = "Plan"
    CONTRACT = "Vertrag"
    REPORT = "Bericht"
    INVOICE = "Rechnung"
    OTHER = "Sonstiges"

class Document(Base):
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projekt.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, default=DocumentType.OTHER)
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    tags = Column(JSON, default=list)
    status = Column(String, default="Aktiv")
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Projekt", backref="documents")
