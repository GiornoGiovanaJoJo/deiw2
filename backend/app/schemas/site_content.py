from typing import Any, Dict
from pydantic import BaseModel

class SiteContentBase(BaseModel):
    content: Dict[str, Any]

class SiteContentCreate(SiteContentBase):
    pass

class SiteContentUpdate(SiteContentBase):
    pass

class SiteContent(SiteContentBase):
    id: int
    key: str

    class Config:
        orm_mode = True
