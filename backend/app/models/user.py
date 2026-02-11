from sqlalchemy import Boolean, Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    PROJECT_MANAGER = "Projektleiter"
    GROUP_LEADER = "Gruppenleiter"
    WORKER = "Worker"
    OFFICE = "Büro"
    WAREHOUSE = "Warehouse"
    CLIENT = "Kunde"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    phone = Column(String, nullable=True)
    role = Column(String, default=UserRole.WORKER) # Storing as string to be flexible
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)

    tasks = relationship("Aufgabe", back_populates="assigned_to")
