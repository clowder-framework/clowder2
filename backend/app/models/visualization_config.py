from typing import Optional

from beanie import Document
from pydantic import BaseModel

from app.models.listeners import ExtractorInfo, EventListenerJobDB
from app.models.metadata import MongoDBRef


class VisualizationConfigBase(BaseModel):
    resource: MongoDBRef
    extractor_info: Optional[ExtractorInfo]
    job: Optional[EventListenerJobDB]
    client: Optional[str]
    vis_config_data: dict = {}
    visualization: str
    visualization_component_id: str
    # TODO add json document or key value pairs, config_variables


class VisualizationConfigIn(VisualizationConfigBase):
    pass


class VisualizationConfigDB(Document, VisualizationConfigBase):
    class Settings:
        name = "vizualization_config"


class VisualizationConfigOut(VisualizationConfigDB):
    class Config:
        fields = {"id": "id"}
