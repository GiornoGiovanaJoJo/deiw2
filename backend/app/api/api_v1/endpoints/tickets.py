from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.ticket import Ticket
from app.schemas.ticket import Ticket as TicketSchema, TicketCreate, TicketUpdate

router = APIRouter()

@router.get("/", response_model=List[TicketSchema])
def read_tickets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(Ticket).offset(skip).limit(limit).all()

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
