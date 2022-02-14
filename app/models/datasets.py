from datetime import datetime
from enum import Enum, auto

from mongoengine import DynamicDocument
from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


class DatasetStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    DEFAULT = auto()
    TRIAL = auto()


class Dataset(MongoModel):
    name: str = "N/A"
    author: PyObjectId = Field(default_factory=PyObjectId)
    description: str = "N/A"
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    views: int = 0
    downloads: int = 0


class MongoDataset(DynamicDocument):
    pass
