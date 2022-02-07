from datetime import datetime
from mongoengine import DynamicDocument
from pydantic import BaseModel, Field
from typing import List

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId

# MiniUser - id, name, email, gravatar (comes with email)
class FileVersion(MongoModel):
    id: str = "1"
    file_id: str = "N/A"  # when v1 is initialized, this won't exist yet
    creator: PyObjectId = Field(default_factory=PyObjectId)
    created: datetime = Field(default_factory=datetime.utcnow)


class ClowderFile(MongoModel):
    name: str = "N/A"
    creator: PyObjectId = Field(default_factory=PyObjectId)
    created: datetime = Field(default_factory=datetime.utcnow)
    version: str = "N/A"  # Minio version ID (if more than one version)
    views: int = 0
    downloads: int = 0
