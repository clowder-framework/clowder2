import json
from datetime import datetime
from typing import Optional

from app.models.files import ContentType
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class VisualizationDataBase(BaseModel):
    name: str = "N/A"
    description: Optional[str] = None

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_to_json

    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, str):
            return cls(**json.loads(value))
        return value


class VisualizationDataIn(VisualizationDataBase):
    pass


class VisualizationDataBaseCommon(VisualizationDataBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: ContentType = ContentType()
    visualization_config_id: PydanticObjectId
    origin_id: Optional[PydanticObjectId] = None


class VisualizationDataDB(Document, VisualizationDataBaseCommon):
    class Settings:
        name = "visualization_data"


class VisualizationDataFreezeDB(Document, VisualizationDataBaseCommon):
    frozen: bool = True

    class Settings:
        name = "visualization_data_freeze"


class VisualizationDataOut(VisualizationDataDB, VisualizationDataFreezeDB):
    class Config:
        fields = {"id": "id"}


class VisualizationDataDBViewList(View, VisualizationDataBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views

    # for dataset versioning
    origin_id: PydanticObjectId
    frozen: bool = False

    class Settings:
        source = VisualizationDataDB
        name = "visualization_data_view"
        pipeline = [
            {
                "$addFields": {
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "visualization_data_freeze",
                    "pipeline": [{"$addFields": {"frozen": True}}],
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5
