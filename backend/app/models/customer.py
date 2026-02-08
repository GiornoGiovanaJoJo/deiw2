from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class CustomerType(str, enum.Enum):
    COMPANY = "Firma"
    PRIVATE = "Privat"

class Customer(Base):
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, default=CustomerType.COMPANY)
    company_name = Column(String, index=True, nullable=True) # For companies
    contact_person = Column(String, nullable=True) # For companies OR full name for individuals
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    status = Column(String, default="Aktiv")

    projects = relationship("Projekt", back_populates="customer")
