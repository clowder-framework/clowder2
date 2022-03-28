from datetime import datetime
from typing import Optional, List
from enum import Enum

from bson.dbref import DBRef
from pydantic import Field, validator, BaseModel, create_model

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.extractors import ExtractorOut


class MongoDBRef(BaseModel):
    def __init__(
        self, collection: str, resource_id: PyObjectId, version: Optional[int]
    ):
        if version is None:
            self.dbref = DBRef(
                collection=collection,
                id=resource_id,
            )
        else:
            self.dbref = DBRef(collection=collection, id=resource_id, version=version)
            self.dbref = DBRef(collection=collection, id=resource_id, version=version)

    __pydantic_model__ = create_model(
        "DBRef",
        collection=(str, "files"),
        resource_id=(PyObjectId, ...),
        version=(int, ...),
    )


class MetadataField(MongoModel):
    name: str
    type: str = "str"  # str,int,float,bool
    list: bool = False  # whether a list[type] is acceptable
    required: bool = False  # TODO: Eventually move this to space level?


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
    # fields required or not - store at instance level


class MetadataAgent(MongoModel):
    creator: UserOut
    extractor: Optional[ExtractorOut]


class MetadataBase(MongoModel):
    context: Optional[dict]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    definition: Optional[str]  # e.g.'map' used for validation
    contents: dict

    @validator("context")
    def contexts_are_valid(cls, v):
        if False:
            raise ValueError("Problem with context.")
        return v

    @validator("context_url")
    def context_url_is_valid(cls, v):
        if False:
            raise ValueError("Problem with context URL.")
        return v

    @validator("definition")
    def definition_is_valid(cls, v):
        if False:
            raise ValueError("Problem with definition.")
        return v


class MetadataIn(MetadataBase):
    pass


class MetadataDB(MetadataBase):
    file: Optional[PyObjectId]
    file_version: Optional[PyObjectId]
    dataset: Optional[PyObjectId]
    resource: MongoDBRef
    agent: MetadataAgent
    created: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True

    @validator("resource")
    def resource_dbref_is_valid(cls, v):
        if False:
            raise ValueError("Problem with db reference.")
        return v


class MetadataOut(MetadataDB):
    pass
