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
    """This describes a metadata object with a short name and description, predefined set of fields, and context.
    These provide a shorthand for use by extractors as well as a source for building GUI widgets to add new entries.

    Example: {
        "name": "LatLon",
        "description": "A set of Latitude/Longitude coordinates",
        "context": {
            "longitude": "https://schema.org/longitude",
            "latitude": "https://schema.org/latitude"
        },
        "fields": [{
            "name": "longitude",
            "type": "float",
            "required": "True"
        },{
            "name": "latitude",
            "type": "float",
            "required": "True"
        }]
    } """
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


class MetadataPatch(MetadataBase):
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
