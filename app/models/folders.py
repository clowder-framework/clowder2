from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class FolderBase(MongoModel):
    name: str = "N/A"


class FolderIn(FolderBase):
    parent_folder: Optional[PyObjectId]


class FolderDB(FolderBase):
    dataset_id: PyObjectId
    parent_folder: Optional[PyObjectId]
    author: PyObjectId = Field(default_factory=PyObjectId)
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)


class FolderOut(FolderDB):
    pass
