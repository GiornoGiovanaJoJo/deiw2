from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class TicketBase(BaseModel):
    subject: str
    message: str
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    sender_phone: Optional[str] = None
    category: Optional[str] = "Anfrage"
    status: Optional[str] = "Neu"
    priority: Optional[str] = "Mittel"
    assigned_to_id: Optional[str] = None
    response: Optional[str] = None
    service_id: Optional[str] = None
    booking_date: Optional[datetime] = None
    source: Optional[str] = "home_form"

class TicketCreate(TicketBase):
    pass

class TicketUpdate(TicketBase):
    pass

class Ticket(TicketBase):
    id: int
    created_date: datetime

    class Config:
        from_attributes = True
