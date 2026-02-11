from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class MessageBase(BaseModel):
    content: str
    recipient_id: int
    project_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    is_read: bool

class Message(MessageBase):
    id: int
    sender_id: int
    project_id: Optional[int]
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True
