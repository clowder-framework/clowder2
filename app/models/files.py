from typing import Optional
import os
from bson import ObjectId
from mongoengine import Document, StringField, IntField, DynamicDocument, connect
from pydantic import BaseModel, Field
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import OID, MongoModel


class ClowderFile(MongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    creator: PyObjectId = PyObjectId("000000000000000000000000")
    name: str = ""
    views: int = 0
    downloads: int = 0


class MongoFile(DynamicDocument):
    pass
