from typing import Optional, List
from pydantic import BaseModel

class ProjectStageBase(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = None
    images: Optional[List[str]] = []
    status: Optional[str] = "Geplant"
    order: Optional[int] = 0
    client_visible: Optional[bool] = False

class ProjectStageCreate(ProjectStageBase):
    pass

class ProjectStageUpdate(ProjectStageBase):
    pass

class ProjectStage(ProjectStageBase):
    id: int

    class Config:
        from_attributes = True
