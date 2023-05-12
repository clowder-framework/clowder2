from datetime import datetime
from typing import Optional

from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel

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


class FolderOut(FolderDB):
    pass
