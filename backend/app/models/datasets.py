from datetime import datetime
from enum import Enum, auto
from typing import Optional, List

import pymongo
from beanie import Document, View, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.authorization import RoleType, AuthorizationDB
from app.models.groups import GroupOut
from app.models.mongomodel import MongoModel
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
    description: str = "N/A"


class DatasetIn(DatasetBase):
    pass


class DatasetPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class DatasetDB(Document, DatasetBase):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    user_views: int = 0
    downloads: int = 0

    class Settings:
        name = "datasets_beanie"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class DatasetDBViewList(View, DatasetBase):
    # FIXME This seems to be required to return _id. Otherwise _id is null in the response.
    id: PydanticObjectId = Field(None, alias="_id")
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]

    class Settings:
        source = DatasetDB
        name = "datasets_beanie_view"
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
    pass


class UserAndRole(BaseModel):
    user: UserOut
    role: RoleType


class GroupAndRole(BaseModel):
    group: GroupOut
    role: RoleType


class DatasetRoles(MongoModel):
    dataset_id: str
    user_roles: List[UserAndRole] = []
    group_roles: List[GroupAndRole] = []
