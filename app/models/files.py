from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FileVersion(MongoModel):
    version_id: str = "N/A"
    file_id: PyObjectId
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)


class FileBase(MongoModel):
    name: str = "N/A"


class FileIn(FileBase):
    pass


class FileDB(FileBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version: str = "N/A"  # Minio version ID (if more than one version)
    dataset_id: PyObjectId
    folder_id: Optional[PyObjectId]
    views: int = 0
    downloads: int = 0


class FileOut(FileDB):
    pass
