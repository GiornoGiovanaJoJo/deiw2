from sqlalchemy import Column, Integer, String, JSON
from app.db.base_class import Base

class SiteContent(Base):
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    content = Column(JSON, nullable=False)
