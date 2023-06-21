from datetime import datetime
from typing import Optional, List

from beanie import Document, View, PydanticObjectId
from pydantic import Field, BaseModel

from app.models.authorization import AuthorizationDB
from app.models.listeners import ExtractorInfo
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class VizConfigBase(BaseModel):
    file_id: PydanticObjectId
    extractor_info: ExtractorInfo
    visualization: PydanticObjectId
    vizualization_mimetype: str

class VizConfigDB(Document, VizConfigBase):
    class Settings:
        name = "vizconfig"



class VizConfigOut(VizConfigDB):
    class Config:
        fields = {"id": "id"}
