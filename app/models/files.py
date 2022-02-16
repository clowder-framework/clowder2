from datetime import datetime
from mongoengine import DynamicDocument
from pydantic import BaseModel, Field
from typing import List

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FileVersion(MongoModel):
    version_id: str = "N/A"
    file_id: PyObjectId
    creator: PyObjectId
    created: datetime = Field(default_factory=datetime.utcnow)


class FileBase(MongoModel):
    name: str = "N/A"
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version: str = "N/A"  # Minio version ID (if more than one version)
    views: int = 0
    downloads: int = 0


class FileIn(FileBase):
    pass


class FileDB(FileBase):
    pass


class FileOut(FileBase):
    pass
