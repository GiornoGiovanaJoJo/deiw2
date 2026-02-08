from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Comment(Base):
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # Project, Stage, Task, Document
    entity_id = Column(String, nullable=False) # ID of the entity
    content = Column(Text, nullable=False)
    user_name = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    parent_comment_id = Column(String, nullable=True)
    mentions = Column(JSON, default=list)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
