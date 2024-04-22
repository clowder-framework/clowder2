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
    parent_folder: Optional[PydanticObjectId]
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    object_type: str = "folder"


class FolderDB(Document, FolderBaseCommon):
    class Settings:
        name = "folders"


class FolderFreezeDB(Document, FolderBaseCommon):
    frozen: bool = True

    class Settings:
        name = "folders_freeze"


class FolderDBViewList(View, FolderBase):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    dataset_id: PydanticObjectId
    parent_folder: Optional[PydanticObjectId]
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]

    class Settings:
        source = FolderDB
        name = "folders_view"
        pipeline = [
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


class FolderOut(FolderDB):
    class Config:
        fields = {"id": "id"}
