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
    )

    # 2.1 Match Category
    from app.models.category import Category
    if ticket.category:
        category = db.query(Category).filter(Category.name == ticket.category).first()
        if category:
            new_project.category_id = category.id
            
            # Copy stages if category found
            if category.modal_config:
                stages_config = category.modal_config.get("stages", [])
                if stages_config:
                    from app.models.project_stage import ProjectStage
                    for stage_data in stages_config:
                        new_stage = ProjectStage(
                            project=new_project, # Relationship handling might differ, usually need project_id but here object is not flushed yet?
                            # DB add will handle valid ID after flush or we add to project.stages list if relationship exists
                            name=stage_data.get("name", "Unnamed Phase"),
                            status=stage_data.get("status", "Geplant"),
                            order=int(stage_data.get("order", 0)),
                            description=f"Standard Phase aus Kategorie {category.name}"
                        )
                        # Ensure we add to session
                        if not new_project.id:
                             # We need to add project first to get ID or add to relationship
                             pass # We will add project later
                        
                        # Better approach: Add project first
                        
    db.add(new_project)
    db.commit()      # Commit to get ID
    db.refresh(new_project)

    # 2.2 Add Stages based on Category (now we have ID)
    if new_project.category_id:
         # Re-fetch category just to be safe or reuse if in scope. We need session attached.
         category = db.query(Category).filter(Category.id == new_project.category_id).first()
         if category and category.modal_config:
            stages_config = category.modal_config.get("stages", [])
            if stages_config:
                from app.models.project_stage import ProjectStage
                for stage_data in stages_config:
                    new_stage = ProjectStage(
                        project_id=new_project.id,
                        name=stage_data.get("name", "Unnamed Phase"),
                        status=stage_data.get("status", "Geplant"),
                        order=int(stage_data.get("order", 0)),
                        description=f"Standard Phase aus Kategorie {category.name}"
                    )
                    db.add(new_stage)
                db.commit()

    
    # 3. Update Ticket
    ticket.status = TicketStatus.CLOSED
    ticket.response = f"Converted to Project {project_number}"
    db.add(ticket)
    
    db.commit()
    db.refresh(new_project)
    
    return new_project
