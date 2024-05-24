from typing import List, Optional

from app.models.listeners import EventListenerJobDB, ExtractorInfo
from app.models.metadata import MongoDBRef
from app.models.visualization_data import VisualizationDataOut
from beanie import Document, PydanticObjectId, View
from pydantic import BaseModel, Field


class VisualizationConfigBase(BaseModel):
    resource: MongoDBRef
    extractor_info: Optional[ExtractorInfo]
    job: Optional[EventListenerJobDB]
    client: Optional[str]
    parameters: dict = {}
    visualization_component_id: str
    visualization_mimetype: str
    visualization_component_id: str


class VisualizationConfigIn(VisualizationConfigBase):
    pass


class VisualizationConfigBaseCommon(VisualizationConfigBase):
    origin_id: Optional[PydanticObjectId] = None


class VisualizationConfigDB(Document, VisualizationConfigBaseCommon):
    class Settings:
        name = "visualization_config"


class VisualizationConfigFreezeDB(Document, VisualizationConfigBaseCommon):
    frozen: bool = True

    class Settings:
        name = "visualization_config_freeze"


class VisualizationConfigOut(VisualizationConfigDB, VisualizationConfigFreezeDB):
    visualization_data: List[VisualizationDataOut] = []

    class Config:
        fields = {"id": "id"}


class VisualizationConfigDBViewList(View, VisualizationConfigBaseCommon):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views

    # for dataset versioning
    origin_id: PydanticObjectId
    frozen: bool = False

    class Settings:
        source = VisualizationConfigDB
        name = "visualization_config_view"
        pipeline = [
            {
                "$addFields": {
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "visualization_config_freeze",
                    "pipeline": [{"$addFields": {"frozen": True}}],
                }
            },
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5
