from datetime import datetime
from enum import Enum, auto
from typing import List, Optional

import pymongo
from app.models.authorization import AuthorizationDB, RoleType
from app.models.groups import GroupOut
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class Member(BaseModel):
    user: UserOut
    editor: bool = False


class ProjectBase(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    name: str
    description: Optional[str] = None
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    dataset_ids: Optional[List[PydanticObjectId]] = []
    folder_ids: Optional[List[PydanticObjectId]] = []
    file_ids: Optional[List[PydanticObjectId]] = []
    creator: UserOut
    users: List[Member] = []


class ProjectDB(Document, ProjectBase):
    class Settings:
        name = "projects"


class ProjectIn(ProjectBase):
    pass


class ProjectOut(ProjectDB):
    class Config:
        fields = {"id": "id"}
