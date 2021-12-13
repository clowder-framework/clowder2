from datetime import datetime
from mongoengine import DynamicDocument
from pydantic import BaseModel, Field
from typing import List

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class FileVersion(BaseModel):
    id: str = "_NA_"
    creator: PyObjectId = Field(default_factory=PyObjectId)
    created: datetime = Field(default_factory=datetime.utcnow)


class ClowderFile(MongoModel):
    creator: PyObjectId = Field(default_factory=PyObjectId)
    name: str = "_NA_"
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    versions: List[FileVersion] = []
    views: int = 0
    downloads: int = 0


class MongoFile(DynamicDocument):
    pass
