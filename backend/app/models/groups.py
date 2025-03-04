from enum import Enum
from typing import List, Optional

from beanie import Document, PydanticObjectId
from pydantic import BaseModel

from app.models.authorization import Provenance
from app.models.users import UserOut


class Member(BaseModel):
    user: UserOut
    editor: bool = False


class GroupType(str, Enum):
    """Certain group types will be hidden from common lists. For example, 'project' type groups are associated with
    specific projects and used to track their membership; those groups are managed using the project interface, not
    the groups interface."""

    STANDARD = "standard"
    PROJECT = "project"


class GroupBase(BaseModel):
    name: str
    description: Optional[str]
    users: List[Member] = []
    type: GroupType = GroupType.STANDARD
    project_id: Optional[PydanticObjectId] = None


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
