from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    type: Optional[str] = "Sonstiges"
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    tags: Optional[List[str]] = []
    status: Optional[str] = "Aktiv"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    created_date: datetime

    class Config:
        from_attributes = True
