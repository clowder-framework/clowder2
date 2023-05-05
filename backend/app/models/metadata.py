import collections.abc
from datetime import datetime
from typing import Optional, List, Union

import pymongo
from beanie import Document, PydanticObjectId
from elasticsearch import Elasticsearch
from fastapi import HTTPException
from pydantic import Field, validator, AnyUrl
from pymongo import MongoClient

from app.models.listeners import (
    EventListenerIn,
    LegacyEventListenerIn,
    EventListenerOut,
    ExtractorInfo,
)
from app.models.mongomodel import MongoModel, MongoDBRef
from app.models.users import UserOut
from app.search.connect import update_record

# List of valid types that can be specified for metadata fields
FIELD_TYPES = {
    "int": int,
    "float": float,
    "str": str,
    "TextField": str,
    "bool": bool,
    # TODO figure out how to parse "yyyymmdd hh:mm:ssssssz" into datetime object
    # "date": datetime.date,
    # "time": datetime.time,
    "date": str,
    "time": str,
    "dict": dict,  # TODO: does this work?
    "enum": str,  # TODO: need a way to validate enum,
    "tuple": tuple,
}  # JSON schema can handle this for us?


class MetadataConfig(MongoModel):
    type: str = "str"  # must be one of FIELD_TYPES


class MetadataEnumConfig(MongoModel):
    type: str = "enum"
    options: List[str]  # a list of options must be provided if type is enum


class MetadataField(MongoModel):
    name: str
    list: bool = False  # whether a list[type] is acceptable
    widgetType: str = "TextField"  # match material ui widget name?
    config: Union[MetadataEnumConfig, MetadataConfig]
    # TODO: Eventually move this to space level?
    required: bool = False  # Whether the definition requires this field


class MetadataDefinitionBase(MongoModel):
    """This describes a metadata object with a short name and description, predefined set of fields, and context.
    These provide a shorthand for use by listeners as well as a source for building GUI widgets to add new entries.

    Example: {
        "name" : "LatLon",
        "description" : "A set of Latitude/Longitude coordinates",
        "context" : [
            {
            "longitude" : "https://schema.org/longitude",
            "latitude" : "https://schema.org/latitude"
            },
        ],
        "fields" : [
            {
                "name" : "longitude",
                "list" : false,
                "widgetType": "TextField",
                "config": {
                    "type" : "float"
                },
                "required" : true
            },
            {
                "name" : "latitude",
                "list" : false,
                "widgetType": "TextField",
                "config": {
                    "type" : "float"
                },
                "required" : true
            }
        ]
    }"""

    name: str
    description: Optional[str]
    context: Optional[
        List[Union[dict, AnyUrl]]
    ]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    fields: List[MetadataField]
    # TODO: Space-level requirements?


class RequiredMetadata(MongoModel):
    # TODO: Endpoints to get lists of what is required, and update these flags
    definition_name: str
    required_on_files: bool
    required_on_datasets: bool


class MetadataDefinitionIn(MetadataDefinitionBase):
    pass


class MetadataDefinitionDB(Document, MetadataDefinitionBase):
    id: PydanticObjectId = Field(None, alias='_id')
    creator: UserOut

    class Settings:
        name = "metadata.definition"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class MetadataDefinitionOut(MetadataDefinitionDB):
    pass


def validate_definition(content: dict, metadata_def: MetadataDefinitionOut):
    """Convenience function for checking if a value matches MetadataDefinition criteria"""
    # Reject if there are any extraneous fields
    for entry in content:
        found = False
        for field in metadata_def.fields:
            if field.name == entry:
                found = True
                break
        if not found:
            raise HTTPException(
                status_code=400,
                detail=f"{metadata_def.name} field does not have a field called {entry}",
            )

    # For all fields in definition, are they present and matching format?
    for field in metadata_def.fields:
        if field.name in content:
            value = content[field.name]
            t = FIELD_TYPES[field.config.type]
            try:
                # Try casting value as required type, raise exception if unable
                content[field.name] = t(content[field.name])
            except ValueError:
                if field.list and type(value) is list:
                    typecast_list = []
                    try:
                        for v in value:
                            typecast_list.append(t(v))
                        content[field.name] = typecast_list
                    except:
                        raise HTTPException(
                            status_code=400,
                            detail=f"{metadata_def.name} field {field.name} requires {field.config.type} for all values in list",
                        )
                raise HTTPException(
                    status_code=400,
                    detail=f"{metadata_def.name} field {field.name} requires {field.config.type}",
                )
        elif field.required:
            raise HTTPException(
                status_code=400,
                detail=f"{metadata_def.name} requires field {field.name}",
            )
    # Return original dict with any type castings applied
    return content


class MetadataAgent(MongoModel):
    """Describes the user who created a piece of metadata. If listener is provided, user refers to the user who
    triggered the job."""

    creator: UserOut
    listener: Optional[EventListenerOut]


class MetadataBase(MongoModel):
    context: Optional[
        List[Union[dict, AnyUrl]]
    ]  # https://json-ld.org/spec/latest/json-ld/#the-context
    context_url: Optional[str]  # single URL applying to contents
    definition: Optional[str]  # name of a metadata definition
    content: dict

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
    listener: Optional[EventListenerIn]
    extractor: Optional[LegacyEventListenerIn]
    extractor_info: Optional[ExtractorInfo]


class MetadataPatch(MetadataIn):
    metadata_id: Optional[str]  # specific metadata ID we are patching


# class MetadataRes():
#     pass
#
#
# class MetadataReqPatch():
#     pass
#
#
# class MetadataResPatch(MetadataRes):
#     pass
#
#
# class MetadataResDelete(MetadataRes):
#     pass


class MetadataDelete(MongoModel):
    metadata_id: Optional[str]  # specific metadata ID we are deleting
    definition: Optional[str]
    listener: Optional[EventListenerIn]
    extractor: Optional[LegacyEventListenerIn]
    extractor_info: Optional[ExtractorInfo]


class MetadataDB(Document, MetadataBase):
    id: PydanticObjectId = Field(None, alias='_id')
    resource: MongoDBRef
    agent: MetadataAgent
    created: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "metadata"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]

    class Config:
        arbitrary_types_allowed = True

    @validator("resource")
    def resource_dbref_is_valid(cls, v):
        if False:
            raise ValueError("Problem with db reference.")
        return v


class MetadataOut(MetadataDB):
    resource: MongoDBRef
    description: Optional[
        str
    ]  # This will be fetched from metadata definition if one is provided (shown by GUI)


async def validate_context(
        db: MongoClient,
        content: dict,
        definition: Optional[str] = None,
        context_url: Optional[str] = None,
        context: Optional[List[Union[dict, AnyUrl]]] = None,
):
    """Convenience function for making sure incoming metadata has valid definitions or resolvable context.

    Returns:
        Metadata content with incoming values typecast to match expected data type of any definitions
    """
    if context is None and context_url is None and definition is None:
        raise HTTPException(
            status_code=400,
            detail=f"Context is required",
        )
    if context is not None:
        pass
    if context_url is not None:
        pass
    if definition is not None:
        if (
                md_def := await db["metadata.definitions"].find_one({"name": definition})
        ) is not None:
            md_def = MetadataDefinitionOut(**md_def)
            content = validate_definition(content, md_def)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"{definition} is not valid metadata definition",
            )
    return content


def deep_update(orig: dict, new: dict):
    """Recursively update a nested dict with any proivded values."""
    for k, v in new.items():
        if isinstance(v, collections.abc.Mapping):
            orig[k] = deep_update(orig.get(k, {}), v)
        else:
            orig[k] = v
    return orig


async def patch_metadata(
        metadata: dict, new_entries: dict, db: MongoClient, es: Elasticsearch
):
    """Convenience function for updating original metadata contents with new entries."""
    try:
        # TODO: For list-type definitions, should we append to list instead?
        updated_content = deep_update(metadata["content"], new_entries)
        updated_content = await validate_context(
            db,
            updated_content,
            metadata.get("definition", None),
            metadata.get("context_url", None),
            metadata.get("context", []),
        )
        metadata["content"] = updated_content
        db["metadata"].replace_one(
            {"_id": metadata["_id"]}, MetadataDB(**metadata).to_mongo()
        )
        # Update entry to the metadata index
        doc = {"doc": {"content": metadata["content"]}}
        update_record(es, "metadata", doc, metadata["_id"])
    except Exception as e:
        raise e
    return MetadataOut.from_mongo(metadata)
