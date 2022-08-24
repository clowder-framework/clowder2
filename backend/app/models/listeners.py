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
from app.models.extractors import ExtractorIn, ExtractorOut, ExtractorIdentifier


class ListenerBase(MongoModel):
    name: str
    version: float
    description: str

class ListenerIn(ListenerBase):
    parameters: list[str]
    active: bool = False

class ListenerDB(ListenerBase):
    parameters: list[str] # TODO: Replace with list of ListenerParameters
    first_ping: datetime = Field(default_factory=datetime.utcnow)
    last_ping: datetime = Field(default_factory=datetime.utcnow)
    instances: list[str] # TODO: Replace with something more specific? Different IPs?
    active: bool = False

class ListenerOut(ListenerDB):
    pass
