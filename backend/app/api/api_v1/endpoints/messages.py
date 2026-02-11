from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api import deps
from app.models.message import Message
from app.schemas.message import MessageCreate, Message as MessageSchema
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=MessageSchema)
def create_message(
    *,
    db: Session = Depends(deps.get_db),
    message_in: MessageCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send a message.
    """
    message = Message(
        sender_id=current_user.id,
        recipient_id=message_in.recipient_id,
        project_id=message_in.project_id,
        content=message_in.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/", response_model=List[MessageSchema])
def read_messages(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve messages for current user (sent and received).
    If project_id is provided, filter by project.
    """
    query = db.query(Message)
    
    if project_id:
        query = query.filter(Message.project_id == project_id)
        # We also need to filter by user visibility (sender or recipient)
        # Ideally, allows any project member to see, but Message struct has sender/recipient.
        # If it's a group chat, new model needed. 
        # Requirement: "chat inside orders". "User can go into it and there is a separate chat".
        # This implies it might be a communication channel with the company. 
        # So sender=User, Recipient=Admin/Manager (or vice-versa).
        # So filtering by sender/recipient is still correct for 1-on-1 context within project.
        query = query.filter(
             or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id)
        )
    else:
         # Global chat / Support chat
        query = query.filter(
            or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id)
        )

    messages = query.order_by(Message.timestamp.desc()).offset(skip).limit(limit).all()
    return messages

@router.get("/conversation/{user_id}", response_model=List[MessageSchema])
def read_conversation(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve conversation with a specific user.
    """
    messages = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.recipient_id == user_id),
            (Message.sender_id == user_id) & (Message.recipient_id == current_user.id)
        )
    ).order_by(Message.timestamp).all()
    return messages
