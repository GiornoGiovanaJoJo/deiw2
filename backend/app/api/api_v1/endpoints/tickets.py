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

@router.post("/{id}/convert-to-project", response_model=Any)
def convert_ticket_to_project(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Convert a ticket to a project.
    Creates a Customer if one doesn't exist for the email.
    Creates a Project linked to that Customer.
    """
    # 0. Get Ticket
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if not ticket.sender_email:
         raise HTTPException(status_code=400, detail="Ticket has no sender email, cannot link to customer.")

    # 1. Find or Create Customer
    from app.models.customer import Customer, CustomerType
    customer = db.query(Customer).filter(Customer.email == ticket.sender_email).first()
    
    if not customer:
        customer = Customer(
            type=CustomerType.PRIVATE, # Default to private
            contact_person=ticket.sender_name,
            email=ticket.sender_email,
            phone=ticket.sender_phone,
            notes=f"Auto-created from Ticket #{ticket.id}"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        
    # 2. Create Project
    from app.models.project import Projekt, ProjectStatus
    from app.api.api_v1.endpoints.projects import generate_project_number
    
    # Generate number
    project_number = generate_project_number(db)
    
    new_project = Projekt(
        projekt_nummer=project_number,
        name=ticket.subject or f"Project from Ticket #{ticket.id}",
        description=ticket.message,
        status=ProjectStatus.GEPLANT,
        customer_id=customer.id,
        # We could try to match category if names align, but for now leave null or default
    )
    
    db.add(new_project)
    
    # 3. Update Ticket
    ticket.status = TicketStatus.CLOSED
    ticket.response = f"Converted to Project {project_number}"
    db.add(ticket)
    
    db.commit()
    db.refresh(new_project)
    
    return new_project
