from datetime import datetime
from enum import Enum, auto
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

from app.models.mongomodel import MongoModel
from app.models.users import UserOut
from app.models.groups import GroupOut
from app.models.authorization import RoleType


class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


class DatasetStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    DEFAULT = auto()
    TRIAL = auto()


class DatasetBase(BaseModel):
    name: str = "N/A"
    description: str = "N/A"


class DatasetIn(DatasetBase):
    pass


class DatasetPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class DatasetDB(MongoModel, DatasetBase):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    views: int = 0
    downloads: int = 0


class DatasetOut(DatasetDB):
    pass


class UserAndRole(BaseModel):
    user: UserOut
    role: RoleType


class GroupAndRole(BaseModel):
    group: GroupOut
    role: RoleType


class DatasetRoles(BaseModel):
    dataset_id: str
    user_roles: List[UserAndRole] = []
    group_roles: List[GroupAndRole] = []

