from datetime import datetime
from typing import Optional
from enum import Enum

from bson.dbref import DBRef
from pydantic import Field, validator

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut


class ExtractorBase(MongoModel):
    name: str
    version: str
    description: str = ""


class ExtractorIn(ExtractorBase):
    pass


class ExtractorDB(ExtractorBase):
    pass


class ExtractorOut(ExtractorDB):
    pass
