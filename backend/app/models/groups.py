from typing import List, Optional

from app.models.authorization import Provenance
from app.models.users import UserOut
from beanie import Document
from pydantic import BaseModel


class Member(BaseModel):
    user: UserOut
    editor: bool = False


class GroupBase(BaseModel):
    name: str
    description: Optional[str]
    users: List[Member] = []


class GroupIn(GroupBase):
    pass


class GroupPatch(BaseModel):
    id: str
    name: Optional[str]
    description: Optional[str]


class GroupDB(Document, GroupBase, Provenance):
    views: int = 0

    class Settings:
        name = "groups"


class GroupOut(GroupDB):
    class Config:
        fields = {"id": "id"}
