from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    entity_type: str
    entity_id: str
    content: str
    user_name: Optional[str] = None
    user_id: Optional[str] = None
    parent_comment_id: Optional[str] = None
    mentions: Optional[List[str]] = []

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_date: datetime

    class Config:
        from_attributes = True
