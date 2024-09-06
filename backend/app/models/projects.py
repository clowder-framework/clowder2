from datetime import datetime
from typing import List, Optional

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.users import UserOut


class ProjectMember(BaseModel):
    user: UserOut
    editor: bool = False


class ProjectBase(BaseModel):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    name: str
    description: Optional[str] = None
    users: List[ProjectMember] = []
    dataset_ids: Optional[List[PydanticObjectId]] = []


class ProjectDB(Document, ProjectBase):
    class Settings:
        name = "projects"


class ProjectIn(ProjectBase):
    pass


class ProjectOut(ProjectDB):
    class Config:
        fields = {"id": "id"}
