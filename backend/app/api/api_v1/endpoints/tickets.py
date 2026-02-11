from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.schemas.ticket import Ticket as TicketSchema, TicketCreate, TicketUpdate

router = APIRouter()

@router.get("/", response_model=List[TicketSchema])
def read_tickets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    tickets = db.query(Ticket).offset(skip).limit(limit).all()
    return tickets

@router.post("/public", response_model=TicketSchema)
def create_public_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_in: TicketCreate,
) -> Any:
    """
    Create new ticket (public access).
    """
    ticket = Ticket(
        subject=ticket_in.subject,
        message=ticket_in.message,
        sender_name=ticket_in.sender_name,
        sender_email=ticket_in.sender_email,
        sender_phone=ticket_in.sender_phone,
        category=ticket_in.category,
        status=TicketStatus.NEW,
        priority=TicketPriority.MEDIUM,
        service_id=ticket_in.service_id,
        booking_date=ticket_in.booking_date,
        source=ticket_in.source
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/", response_model=TicketSchema)
def create_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_in: TicketCreate,
) -> Any:
    ticket = Ticket(**ticket_in.dict())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.put("/{id}", response_model=TicketSchema)
def update_ticket(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    ticket_in: TicketUpdate,
) -> Any:
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    update_data = ticket_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
