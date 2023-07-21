from datetime import datetime
from enum import Enum, auto
from typing import Optional, List

import pymongo
from beanie import Document, View, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.authorization import RoleType, AuthorizationDB
from app.models.groups import GroupOut
from app.models.users import UserOut


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
    description: Optional[str] = None


class DatasetIn(DatasetBase):
    pass


class DatasetPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class DatasetDB(Document, DatasetBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    user_views: int = 0
    downloads: int = 0
    thumbnail_id: Optional[PydanticObjectId] = None

    class Settings:
        name = "datasets"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class DatasetDBViewList(View, DatasetBase):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]
    thumbnail_id: Optional[PydanticObjectId] = None

    class Settings:
        source = DatasetDB
        name = "datasets_view"
        pipeline = [
            {
                "$lookup": {
                    "from": "authorization",
                    "localField": "_id",
                    "foreignField": "dataset_id",
                    "as": "auth",
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class DatasetOut(DatasetDB):
    class Config:
        fields = {"id": "id"}


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
