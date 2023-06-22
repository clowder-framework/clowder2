from datetime import datetime
from typing import Optional, List

from beanie import Document, View, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.files import FileContentType
from app.models.users import UserOut


class VisualizationsBase(BaseModel):
    name: str = "N/A"
    description: Optional[str] = None


class VisualizationsIn(VisualizationsBase):
    pass


class VisualizationsPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class VisualizationsDB(View, VisualizationsBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: FileContentType = FileContentType()

    class Settings:
        name = "Visualizations"


class VisualizationsList(View, VisualizationsBase):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0


class VisualizationsOut(VisualizationsDB):
    class Config:
        fields = {"id": "id"}
