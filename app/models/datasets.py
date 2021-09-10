from typing import Optional

from bson import ObjectId
from mongoengine import Document, StringField, IntField, DynamicDocument
from pydantic import BaseModel, Field


class Dataset(BaseModel):
    name: str
    description: str = None
    views: int
    downloads: int = None


# class MongoDataset(Document):
#     name = StringField()
#     description = StringField()
#     price = IntField()
#     tax = IntField()


class MongoDataset(DynamicDocument):
    pass
