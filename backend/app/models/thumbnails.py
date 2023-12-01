from datetime import datetime

from beanie import Document
from pydantic import BaseModel, Field

from app.models.files import ContentType
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
    downloads: int = 0

    class Settings:
        name = "thumbnails"


class ThumbnailOut(ThumbnailDB):
    class Config:
        fields = {"id": "id"}
