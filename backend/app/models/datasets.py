from datetime import datetime
from enum import Enum, auto
from typing import Optional, List

import pymongo
from beanie import Document, View, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.authorization import RoleType, AuthorizationDB
from app.models.groups import GroupOut
from app.models.users import UserOut


class FrozenState(str, Enum):
    """A user can have one of the following roles for a specific dataset. Since we don't currently implement permissions
    there is an implied hierarchy between these roles OWNER > EDITOR > UPLOADER > VIEWER. For example, if a route
    requires VIEWER any of the roles can access that resource."""

    FROZEN = "frozen"
    FROZEN_DRAFT = "frozen_draft"
    ACTIVE = "active"


class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


class DatasetStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    AUTHENTICATED = auto()
    DEFAULT = auto()
    TRIAL = auto()


class DatasetBase(BaseModel):
    name: str = "N/A"
    description: Optional[str] = None
    status: str = DatasetStatus.PRIVATE.name


class DatasetIn(DatasetBase):
    pass


class DatasetBaseCommon(DatasetBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    user_views: int = 0
    downloads: int = 0
    thumbnail_id: Optional[PydanticObjectId] = None


class DatasetPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]
    status: Optional[str]


class DatasetDB(Document, DatasetBaseCommon):
    frozen: FrozenState = FrozenState.ACTIVE
    frozen_version_num: int = -999
    origin_id: PydanticObjectId = None

    class Settings:
        name = "datasets"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class DatasetFreezeDB(Document, DatasetBaseCommon):
    frozen: FrozenState = FrozenState.FROZEN
    frozen_version_num: int = 1
    origin_id: PydanticObjectId

    class Settings:
        name = "datasets_freeze"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class DatasetDBViewList(View, DatasetBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]
    thumbnail_id: Optional[PydanticObjectId] = None
    status: str = DatasetStatus.PRIVATE.name
    frozen: FrozenState = FrozenState.ACTIVE
    frozen_version_num: int = -999
    origin_id: PydanticObjectId = None

    class Settings:
        source = DatasetFreezeDB
        name = "datasets_view"

        pipeline = [
            {
                "$unionWith": {
                    "coll": "datasets",
                    "pipeline": [
                        {
                            "$addFields": {
                                "frozen": {"$ifNull": ["$frozen", FrozenState.ACTIVE]},
                                "frozen_version_num": {"$ifNull": ["$frozen_version_num", -999]},
                                "origin_id": "$_id"
                            }
                        }
                    ]
                }
            },
            {
                "$sort": {
                    "origin_id": 1,
                    "frozen": 1,
                    "frozen_version_num": -1
                }
            },
            {
                "$facet": {
                    "active": [
                        {"$match": {"frozen": FrozenState.ACTIVE}},
                    ],
                    "drafts": [
                        {"$match": {"frozen": FrozenState.FROZEN_DRAFT}},
                        {"$group": {
                            "_id": "$origin_id",
                            "doc": {"$first": "$$ROOT"}
                        }}
                    ],
                    "published": [
                        {"$match": {"frozen": FrozenState.FROZEN}},
                        {"$group": {
                            "_id": "$origin_id",
                            "doc": {"$first": "$$ROOT"}
                        }}
                    ]
                }
            },
            {
                "$project": {
                    "allVersions": {"$setUnion": ["$drafts.doc", "$published.doc", "$active"]},
                }
            },
            {
                "$unwind": "$allVersions"
            },
            {
                "$replaceRoot": {"newRoot": "$allVersions"}
            },
            {
                "$lookup": {
                    "from": "authorization",
                    "localField": "_id",
                    "foreignField": "dataset_id",
                    "as": "auth"
                }
            }
        ]

        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class DatasetOut(DatasetDB):
    class Config:
        fields = {"id": "id"}


class DatasetFreezeOut(DatasetFreezeDB):
    class Config:
        fields = {"id": "id"}


class CombinedDataset(DatasetOut, DatasetFreezeOut):
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
