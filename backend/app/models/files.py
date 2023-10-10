from datetime import datetime
from typing import Optional, List

from beanie import Document, View, PydanticObjectId
from pydantic import Field, BaseModel

from app.models.authorization import AuthorizationDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class ContentType(BaseModel):
    """This model describes the content type of any type of file(File or Visualization data) uploaded to Clowder. A typical example is "text/plain" for .txt.
    In Clowder v1 extractors, "text/*" syntax is acceptable for wildcard matches. To support this, the content type is
    split into main ("text") and secondary ("plain") parts so the dynamic matching with * can still be done.

    """

    content_type: str = "N/A"
    main_type: str = "N/A"


class FileVersion(BaseModel):
    file_id: PydanticObjectId
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version_id: str
    version_num: int = 1
    bytes: int = 0


class FileVersionDB(Document, FileVersion):
    class Settings:
        name = "file_versions"


class FileBase(BaseModel):
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
    content_type: ContentType = ContentType()
    thumbnail_id: Optional[PydanticObjectId] = None

    class Settings:
        name = "files"


class FileDBViewList(View, FileBase):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    version_id: str = "N/A"
    version_num: int = 0
    dataset_id: PyObjectId
    folder_id: Optional[PyObjectId]
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]
    bytes: int = 0
    content_type: ContentType = ContentType()
    thumbnail_id: Optional[PydanticObjectId] = None

    class Settings:
        source = FileDB
        name = "files_view"
        pipeline = [
            {
                "$lookup": {
                    "from": "authorization",
                    "localField": "dataset_id",
                    "foreignField": "dataset_id",
                    "as": "auth",
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class FileOut(FileDB):
    class Config:
        fields = {"id": "id"}
