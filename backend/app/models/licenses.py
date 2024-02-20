from datetime import datetime
from typing import List

from pydantic import BaseModel, Field
from beanie import Document, View, PydanticObjectId

from backend.app.models.users import UserOut


class LicenseBase(BaseModel):
    name: str
    type: str
    text: str
    url: str
    version: str
    holders: List[UserOut]
    expiration_date: datetime = Field(default_factory=datetime.utcnow)
    allow_download: bool = False

class LicenseIn(LicenseBase):
    pass

class LicenseDB(Document, LicenseBase):
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "licenses"

class LicenseOut(LicenseDB):
    class Config:
        fields = {"id": "id"}

