from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel
from beanie import Document, View, PydanticObjectId
from app.models.mongomodel import OID, MongoModel
from app.models.users import UserOut
from app.models.authorization import Provenance, RoleType


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


class GroupOut(GroupDB):
    pass


class GroupAndRole(BaseModel):
    group_id: str
    group_name: str
    roleType: str
