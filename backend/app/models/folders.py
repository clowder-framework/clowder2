from datetime import datetime
from typing import List, Optional

from app.models.authorization import AuthorizationDB
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class FolderBase(BaseModel):
    name: str = "N/A"


class FolderPatch(BaseModel):
    name: Optional[str]
    parent_folder: Optional[PydanticObjectId]


class FolderIn(FolderBase):
    parent_folder: Optional[PydanticObjectId]


class FolderBaseCommon(FolderBase):
    dataset_id: PydanticObjectId
    parent_folder: Optional[PydanticObjectId] = None
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    object_type: str = "folder"
    origin_id: Optional[PydanticObjectId] = None


class FolderDB(Document, FolderBaseCommon):
    class Settings:
        name = "folders"


class FolderFreezeDB(Document, FolderBaseCommon):
    frozen: bool = True

    class Settings:
        name = "folders_freeze"


class FolderDBViewList(View, FolderBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    auth: List[AuthorizationDB]

    # for dataset versioning
    origin_id: PydanticObjectId
    frozen: bool = False

    class Settings:
        source = FolderDB
        name = "folders_view"
        pipeline = [
            {
                "$addFields": {
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "folders_freeze",
                    "pipeline": [{"$addFields": {"frozen": True}}],
                }
            },
            {
                "$lookup": {
                    "from": "authorization",
                    "localField": "dataset_id",
                    "foreignField": "dataset_id",
                    "as": "auth",
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class FolderOut(FolderDB, FolderFreezeDB):
    class Config:
        fields = {"id": "id"}
