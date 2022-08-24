import collections.abc
import traceback
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
from app.models.listeners import ListenerOut


class SearchResourceType(Enum):
    file: "files"
    dataset: "datasets"


class SearchField(Enum):
    """Controlled search fields (not dynamic like metadata fields)"""
    name: "name"
    description: "description"
    version: "version_num"


class SearchCriteria(MongoModel):
    search_field: Optional[SearchField] = None
    metadata_field: Optional[str] = None
    metadata_listener: Optional[str] = None
    operator: str
    value: str


class FeedBase(MongoModel):
    name: str
    creator: UserOut
    resource_type: SearchResourceType = SearchResourceType.file


class FeedIn(FeedBase):
    query: str


class FeedDB(FeedBase):
    criteria: list[SearchCriteria]
    listeners: list[ListenerOut]


class FeedOut(FeedDB):
    pass
