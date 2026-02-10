from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class TicketStatus(str, enum.Enum):
    NEW = "Neu"
    IN_PROGRESS = "In Bearbeitung"
    ANSWERED = "Beantwortet"
    CLOSED = "Geschlossen"

class TicketPriority(str, enum.Enum):
    LOW = "Niedrig"
    MEDIUM = "Mittel"
    HIGH = "Hoch"

class Ticket(Base):
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    sender_name = Column(String, nullable=True)
    sender_email = Column(String, nullable=True)
    sender_phone = Column(String, nullable=True)
    category = Column(String, default="Anfrage")
    status = Column(String, default=TicketStatus.NEW)
    priority = Column(String, default=TicketPriority.MEDIUM)
    assigned_to_id = Column(String, nullable=True) # User ID as string or int? Let's use string for flexibility if external auth
    response = Column(Text, nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # New fields for Service Booking
    service_id = Column(String, nullable=True)
    booking_date = Column(DateTime(timezone=True), nullable=True)
    source = Column(String, default="home_form") # "home_form", "service_modal", "contact_page"
