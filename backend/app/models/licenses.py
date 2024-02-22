from datetime import datetime
from typing import List

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from app.models.authorization import Provenance
from app.models.users import UserOut


class LicenseBase(BaseModel):
    name: str
    type: str
    text: str
    url: str
    version: str
    holders: List[UserOut] = []
    expiration_date: datetime = Field(
        default_factory=datetime.utcnow
    )  # TODO: shoudn't the default be never?
    allow_download: bool = False
    dataset_id: PydanticObjectId


class LicenseIn(LicenseBase):
    pass


class LicenseDB(Document, LicenseBase, Provenance):
    class Settings:
        name = "licenses"


class LicenseOut(LicenseDB):
    class Config:
        fields = {"id": "id"}
