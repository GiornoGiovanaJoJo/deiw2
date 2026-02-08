from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class CashRegisterStatus(str, enum.Enum):
    CONNECTED = "Подключена"
    DISCONNECTED = "Не подключена"
    ERROR = "Ошибка"

class CashRegister(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    register_number = Column(String, unique=True, index=True)
    api_key = Column(String, nullable=True)
    status = Column(String, default=CashRegisterStatus.DISCONNECTED)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=True)
