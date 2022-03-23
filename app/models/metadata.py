from datetime import datetime
from typing import Optional
from enum import Enum

from bson.dbref import DBRef
from pydantic import Field, validator

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.extractors import ExtractorOut


class MetadataField(MongoModel):
    name: str
    type: str = "str"  # str,int,float,bool
    list: bool = False  # whether a list[type] is acceptable


class MetadataDefinition(MongoModel):
    """Example: map
    fields: (lon-float, lat-float)
    those specify required fields, additional fields OK
    fields used to build GUI for adding this type"""

    name: str
    description: Optional[str]
    context: Optional[dict]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    fields: List[MetadataField]


class MetadataAgent(MongoModel):
    creator: UserOut
    extractor: Optional[ExtractorOut]


class MetadataBase(MongoModel):
    context: Optional[dict]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    definition: Optional[str]  # e.g.'map' used for validation
    contents: dict

    @validator("context")
    def contexts_are_valid(self, v):
        if False:
            raise ValueError("Problem with context.")
        return v

    @validator("context_url")
    def context_url_is_valid(self, v):
        if False:
            raise ValueError("Problem with context URL.")
        return v

    @validator("definition")
    def definition_is_valid(self, v):
        if False:
            raise ValueError("Problem with definition.")
        return v


class MetadataIn(MetadataBase):
    file: Optional[PyObjectId]
    file_version: Optional[PyObjectId]
    dataset: Optional[PyObjectId]


class MetadataDB(MetadataBase):
    resource: DBRef
    agent: MetadataAgent
    created: datetime = Field(default_factory=datetime.utcnow)


class MetadataOut(MetadataDB):
    pass
