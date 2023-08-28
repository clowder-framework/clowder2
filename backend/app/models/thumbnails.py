from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field

from app.models.files import ContentType
from app.models.metadata import MongoDBRef
from app.models.users import UserOut


class ThumbnailBase(BaseModel):
    pass


class ThumbnailIn(ThumbnailBase):
    pass


class ThumbnailDB(Document, ThumbnailBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: ContentType = ContentType()

    class Settings:
        name = "thumbnails"


class ThumbnailOut(ThumbnailDB):
    class Config:
        fields = {"id": "id"}
