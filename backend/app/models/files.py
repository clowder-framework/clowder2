from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FileVersion(MongoModel):
    version_id: str
    version_num: int = 1
    file_id: PyObjectId
    creator: UserOut
    bytes: int = 0
    content_type: str = "N/A"
    created: datetime = Field(default_factory=datetime.utcnow)


class FileBase(MongoModel):
    name: str = "N/A"


class FileIn(FileBase):
    pass


class FileDB(FileBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version_id: str = "N/A"
    version_num: int = 0
    dataset_id: PyObjectId
    folder_id: Optional[PyObjectId]
    views: int = 0
    downloads: int = 0
    bytes: int = 0
    content_type: str = "N/A"


class FileOut(FileDB):
    pass
