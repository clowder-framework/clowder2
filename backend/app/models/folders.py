from datetime import datetime
from typing import Optional, List

from beanie import Document, View
from pydantic import Field, BaseModel

from app.models.authorization import AuthorizationDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FolderBase(BaseModel):
    name: str = "N/A"


class FolderIn(FolderBase):
    parent_folder: Optional[PyObjectId]


class FolderDB(Document, FolderBase):
    dataset_id: PyObjectId
    parent_folder: Optional[PyObjectId]
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "folders"


class FolderDBViewList(View, FolderBase):
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
