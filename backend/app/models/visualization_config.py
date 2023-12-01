from typing import List, Optional

from beanie import Document
from pydantic import BaseModel

from app.models.listeners import EventListenerJobDB, ExtractorInfo
from app.models.metadata import MongoDBRef
from app.models.visualization_data import VisualizationDataOut


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


class VisualizationConfigDB(Document, VisualizationConfigBase):
    class Settings:
        name = "visualization_config"


class VisualizationConfigOut(VisualizationConfigDB):
    visualization_data: List[VisualizationDataOut] = []

    class Config:
        fields = {"id": "id"}
