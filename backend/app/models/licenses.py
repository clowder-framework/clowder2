from datetime import datetime
from typing import List

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.authorization import Provenance
from app.models.users import UserOut


class LicenseBase(BaseModel):
    name: str
    description: str
    url: str
    version: str
    holders: str
    expiration_date: datetime = Field(None)
    dataset_id: PydanticObjectId


class LicenseIn(LicenseBase):
    pass


class LicenseDB(Document, LicenseBase, Provenance):
    class Settings:
        name = "licenses"


class LicenseOut(LicenseDB):
    class Config:
        fields = {"id": "id"}
