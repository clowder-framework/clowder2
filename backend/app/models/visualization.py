from datetime import datetime
from typing import Optional, List
import json

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.files import ContentType
from app.models.users import UserOut


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


class VisualizationDataDB(Document, VisualizationDataBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: ContentType = ContentType()

    class Settings:
        name = "visualization_data"


class VisualizationDataOut(VisualizationDataDB):
    class Config:
        fields = {"id": "id"}
