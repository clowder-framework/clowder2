from mongoengine import DynamicDocument
from mongoengine import DynamicDocument
from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class ClowderFile(MongoModel):
    creator: PyObjectId = Field(default_factory=PyObjectId)
    name: str = "_NA_"
    views: int = 0
    downloads: int = 0


class MongoFile(DynamicDocument):
    pass
