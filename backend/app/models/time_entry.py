from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TimeEntry(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    user_name = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(String, nullable=False) # HH:MM
    end_time = Column(String, nullable=True) # HH:MM
    hours = Column(Float, nullable=True)
    project_id = Column(Integer, ForeignKey("projekt.id"), nullable=True)
    project_number = Column(String, nullable=True)
    location = Column(String, default="Büro")
    note = Column(Text, nullable=True)

    user = relationship("User", backref="time_entries")
    project = relationship("Projekt")
