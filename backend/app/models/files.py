from datetime import datetime
from typing import Optional

from beanie import Document, PydanticObjectId
from pydantic import Field, BaseModel

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class FileContentType(BaseModel):
    """This model describes the content type of a file uploaded to Clowder. A typical example is "text/plain" for .txt.
    In Clowder v1 extractors, "text/*" syntax is acceptable for wildcard matches. To support this, the content type is
    split into main ("text") and secondary ("plain") parts so the dynamic matching with * can still be done.

    """

    content_type: str = "N/A"
    main_type: str = "N/A"


class FileVersion(MongoModel):
    file_id: PyObjectId
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version_id: str
    version_num: int = 1
    bytes: int = 0


class FileVersionDB(Document, FileVersion):
    class Settings:
        name = "file_versions"


class FileBase(MongoModel):
    name: str = "N/A"


class FileIn(FileBase):
    pass


class FileDB(Document, FileBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version_id: str = "N/A"
    version_num: int = 0
    dataset_id: PyObjectId
    folder_id: Optional[PyObjectId]
    views: int = 0
    downloads: int = 0
    bytes: int = 0
    content_type: FileContentType = FileContentType()

    class Settings:
        name = "files"


class FileOut(FileDB):
    pass
