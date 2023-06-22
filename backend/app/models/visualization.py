from datetime import datetime
from typing import Optional, List

from beanie import Document, View, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.files import FileContentType
from app.models.users import UserOut


class VisualizationBase(BaseModel):
    name: str = "N/A"
    description: Optional[str] = None


class VisualizationIn(VisualizationBase):
    pass


class VisualizationPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class VisualizationDB(View, VisualizationBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0
    content_type: FileContentType = FileContentType()

    class Settings:
        name = "visualization"


class VisualizationList(View, VisualizationBase):
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    bytes: int = 0


class VisualizationOut(VisualizationDB):
    class Config:
        fields = {"id": "id"}
