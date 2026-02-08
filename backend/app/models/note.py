from sqlalchemy import Column, Integer, String, Text, Date, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Note(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    files = Column(JSON, default=list)
    user_id = Column(Integer, ForeignKey("user.id"))
    user_name = Column(String, nullable=True)
    color = Column(String, default="blau")
    is_important = Column(Boolean, default=False)

    user = relationship("User", backref="notes")
