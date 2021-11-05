import datetime
from typing import Optional, List
from enum import Enum, auto
import os
from bson import ObjectId
from mongoengine import Document, StringField, IntField, DynamicDocument, ListField, connect
from pydantic import BaseModel, Field
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import OID, MongoModel

class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name

class DatasetStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    DEFALT = auto()
    TRIAL = auto()


class Dataset(MongoModel):
    name: str = "N/A"
    author: PyObjectId
    description: str = "N/A"
    created: datetime.datetime = datetime.datetime.now()
    files: List[PyObjectId] = []
    folders: List[PyObjectId] = []
    stream_id: List[PyObjectId] = []
    tags: List[str] = []
    metadataCount: int = 0
    collections: List[PyObjectId] = []
    thumbnail_id: str = None
    licenseData: str = ""
    spaces: List[PyObjectId] = []
    lastModifiedDate: datetime.date = datetime.date.today()
    trash: bool = False
    dateMovedToTrash: datetime.datetime = None
    followers: List[PyObjectId] = []
    stats: str = ""
    status: str = DatasetStatus.PRIVATE.name
    creators: List[PyObjectId] = []
    views: int = 0
    downloads: int = 0


# class MongoDataset(Document):
#     name = StringField()
#     description = StringField()
#     price = IntField()
#     tax = IntField()


class MongoDataset(DynamicDocument):
    pass
