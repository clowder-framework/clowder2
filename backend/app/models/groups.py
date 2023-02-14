from datetime import datetime
from typing import Optional

from mongoengine import DynamicDocument
from pydantic import Field, BaseModel
from pydantic import Field

from app.models.mongomodel import OID, MongoModel
from app.models.users import UserOut


class Member():
    user: UserOut
    isOwner: bool = False


class GroupBase(BaseModel):
    name: str = "N/A"
    description: str = "N/A"
    userList = [Member()]


class GroupIn(GroupBase):
    pass


class GroupPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class GroupDB(MongoModel, GroupBase):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0


class GroupOut(GroupDB):
    pass
