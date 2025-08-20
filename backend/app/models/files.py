from datetime import datetime
from enum import Enum, auto
from typing import List, Optional

from app.models.authorization import AuthorizationDB
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


class FileStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    AUTHENTICATED = auto()
    DEFAULT = auto()
    TRIAL = auto()


class StorageType(str, Enum):
    """Depending on the StorageType,the file may need different properties such as local path or URL.
    Also, some StorageTypes do not support versioning or anonymous sharing."""

    MINIO = "minio"
    LOCAL = "local"
    REMOTE = "remote"
    AWS = "aws"


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
    status: str = FileStatus.PRIVATE.name


class FileIn(FileBase):
    pass


class LocalFileIn(BaseModel):
    """Used when adding a file from a local disk."""

    path: str


class FileBaseCommon(FileBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    version_id: str = "N/A"
    version_num: int = 0
    dataset_id: PydanticObjectId
    folder_id: Optional[PydanticObjectId]
    views: int = 0
    downloads: int = 0
    bytes: int = 0
    content_type: ContentType = ContentType()
    thumbnail_id: Optional[PydanticObjectId] = None
    storage_type: StorageType = StorageType.MINIO
    storage_path: Optional[str]  # store URL or file path depending on storage_type
    object_type: str = "file"
    origin_id: Optional[PydanticObjectId] = None


class FileDB(Document, FileBaseCommon):
    class Settings:
        name = "files"

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class FileFreezeDB(Document, FileBaseCommon):
    frozen: bool = True

    class Settings:
        name = "files_freeze"


class FileDBViewList(View, FileBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    auth: List[AuthorizationDB]

    # for dataset versioning
    origin_id: PydanticObjectId
    frozen: bool = False

    class Settings:
        source = FileDB
        name = "files_view"
        pipeline = [
            {
                "$addFields": {
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "files_freeze",
                    "pipeline": [{"$addFields": {"frozen": True}}],
                }
            },
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


class FileOut(FileDB, FileFreezeDB):
    class Config:
        fields = {"id": "id"}
