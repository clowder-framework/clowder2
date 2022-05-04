from datetime import datetime
from enum import Enum, auto
from typing import Optional

from mongoengine import DynamicDocument
from pydantic import Field, BaseModel
from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import OID, MongoModel
from app.models.users import UserOut


class AutoName(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


class DatasetStatus(AutoName):
    PRIVATE = auto()
    PUBLIC = auto()
    DEFAULT = auto()
    TRIAL = auto()


class DatasetBase(BaseModel):
    name: str = "N/A"
    description: str = "N/A"


class DatasetIn(DatasetBase):
    pass


class DatasetPatch(BaseModel):
    name: Optional[str]
    description: Optional[str]


class DatasetDB(MongoModel, DatasetBase):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    status: str = DatasetStatus.PRIVATE.name
    views: int = 0
    downloads: int = 0


class DatasetOut(DatasetDB):
    pass
