from datetime import datetime
from typing import Optional, List

from beanie import Document, View, PydanticObjectId
from pydantic import Field, BaseModel

from app.models.authorization import AuthorizationDB
from app.models.listeners import ExtractorInfo, EventListenerJobDB
from app.models.metadata import MongoDBRef
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class VisualizationConfigBase(BaseModel):
    resource: MongoDBRef
    extractor_info: Optional[ExtractorInfo]
    job: Optional[EventListenerJobDB]
    client: Optional[str]
    parameters: dict = {}
    visualization_bytes_ids: List[PyObjectId]


class VisualizationConfigIn(VisualizationConfigBase):
    pass


class VisualizationConfigDB(Document, VisualizationConfigBase):
    class Settings:
        name = "vizualization_config"


class VisualizationConfigOut(VisualizationConfigDB):
    class Config:
        fields = {"id": "id"}
