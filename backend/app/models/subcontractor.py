from sqlalchemy import Column, Integer, String, Float, Text, Enum
from app.db.base_class import Base

class Subcontractor(Base):
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    status = Column(String, default="Aktiv")
    notes = Column(Text, nullable=True)
    hourly_rate = Column(Float, nullable=True)
