from datetime import datetime
from typing import Optional

from app.models.files import ContentType
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class ThumbnailBase(BaseModel):
    pass


class ThumbnailIn(ThumbnailBase):
    pass


class ThumbnailBaseCommon(ThumbnailBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: ContentType = ContentType()
    downloads: int = 0
    origin_id: Optional[PydanticObjectId] = None


class ThumbnailDB(Document, ThumbnailBaseCommon):
    class Settings:
        name = "thumbnails"


class ThumbnailFreezeDB(Document, ThumbnailBaseCommon):
    frozen: bool = True

    class Settings:
        name = "thumbnails_freeze"


class ThumbnailDBViewList(View, ThumbnailBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views

    # for dataset versioning
    origin_id: PydanticObjectId
    frozen: bool = False

    class Settings:
        source = ThumbnailDB
        name = "thumbnails_view"
        pipeline = [
            {
                "$addFields": {
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "thumbnails_freeze",
                    "pipeline": [{"$addFields": {"frozen": True}}],
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class ThumbnailOut(ThumbnailDB, ThumbnailFreezeDB):
    class Config:
        fields = {"id": "id"}
