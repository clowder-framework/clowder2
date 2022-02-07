import datetime
from typing import List, Optional

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class FolderBase(MongoModel):
    name: str = "N/A"
    parent_dataset: PyObjectId
    parent_folder: Optional[PyObjectId]


class FolderIn(FolderBase):
    pass


class FolderDB(FolderBase):
    author: PyObjectId = Field(default_factory=PyObjectId)
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)


class FolderOut(FolderDB):
    pass
