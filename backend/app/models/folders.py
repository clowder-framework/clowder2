from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FolderBase(MongoModel):
    name: str = "N/A"


class FolderIn(FolderBase):
    parent_folder: Optional[PyObjectId]


class FolderDB(FolderBase):
    dataset_id: PyObjectId
    parent_folder: Optional[PyObjectId]
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)


class FolderOut(FolderDB):
    pass
