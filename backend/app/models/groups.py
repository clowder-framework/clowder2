from datetime import datetime
from typing import Optional, List

from pydantic import Field, BaseModel

from app.models.mongomodel import OID, MongoModel
from app.models.users import UserOut
from app.models.authorization import Provenance


class Member(BaseModel):
    user: UserOut
    isOwner: bool = False


class GroupBase(BaseModel):
    name: str
    description: Optional[str]
    users: List[Member] = []


class GroupIn(GroupBase):
    pass


class GroupPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class GroupDB(MongoModel, GroupBase, Provenance):
    views: int = 0


class GroupOut(GroupDB):
    pass
