import collections.abc
from datetime import datetime
from typing import Optional, List
from enum import Enum

from bson import ObjectId
from bson.dbref import DBRef
from pydantic import Field, validator, BaseModel, create_model
from fastapi import HTTPException
from pymongo import MongoClient

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.extractors import ExtractorIn, ExtractorOut


class MongoDBRef(BaseModel):
    collection: str
    resource_id: PyObjectId
    version: Optional[int]


# List of valid types that can be specified for metadata fields
FIELD_TYPES = {
    'int': int,
    'float': float,
    'str': str,
    'bool': bool,
    'date': datetime.date,
    'time': datetime.time
}


class MetadataField(MongoModel):
    name: str
    type: str = "str"  # must be one of FIELD_TYPES
    list: bool = False  # whether a list[type] is acceptable
    required: bool = False  # TODO: Eventually move this to space level?


class MetadataDefinitionBase(MongoModel):
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


class MetadataDefinitionIn(MetadataDefinitionBase):
    pass


class MetadataDefinitionDB(MetadataDefinitionBase):
    creator: UserOut


class MetadataDefinitionOut(MetadataDefinitionDB):
    pass


def validate_definition(contents: dict, metadata_def: MetadataDefinitionOut):
    """Convenience function for checking if a value matches MetadataDefinition criteria"""
    for field in metadata_def.fields:
        if field.name in contents:
            t = FIELD_TYPES[field.type]
            try:
                contents[field.name] = t(contents[field.name])
            except ValueError:
                if field.list and type(value) is list:
                    typecast_list = []
                    try:
                        for v in value:
                            typecast_list.append(t(v))
                        contents[field.name] = typecast_list
                    except:
                        raise HTTPException(status_code=400,
                                            detail=f"{metadata_def.name} field {field.name} requires {field.type} for all values in list")
                raise HTTPException(status_code=400,
                                    detail=f"{metadata_def.name} field {field.name} requires {field.type}")
        elif field.required:
            raise HTTPException(status_code=400, detail=f"{metadata_def.name} requires field {field.name}")
    # Return original dict with any type castings applied
    return contents

class MetadataAgent(MongoModel):
    creator: UserOut
    extractor: Optional[ExtractorOut]


class MetadataBase(MongoModel):
    context: Optional[dict]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    definition: Optional[str]  # name of a metadata definition
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
        # TODO: Possible to query MongoDB here with name? Currently done in routers
        if False:
            raise ValueError("Problem with definition.")
        return v


class MetadataIn(MetadataBase):
    file_version: Optional[int]
    extractor_info: Optional[ExtractorIn]


class MetadataPatch(MetadataIn):
    pass


class MetadataDB(MetadataBase):
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


def deep_update(orig, new):
    """Recursively update a nested dict with any proivded values."""
    for k, v in new.items():
        if isinstance(v, collections.abc.Mapping):
            orig[k] = deep_update(orig.get(k, {}), v)
        else:
            orig[k] = v
    return orig


def patch_metadata(metadata: dict, new_entries: dict, db: MongoClient):
    """Convenience function for updating original metadata with some new entries."""
    try:
        # TODO: Need to handle if they are changing context
        # TODO: Need to validate new_entries against context
        metadata = deep_update(metadata, new_entries)
        print(metadata)
        db["metadata"].replace_one(
            {"_id": metadata["_id"]}, MetadataDB(**metadata).to_mongo()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=e.args[0])
    return MetadataOut.from_mongo(metadata)
