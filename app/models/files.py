from typing import Optional
import os
from bson import ObjectId
from mongoengine import Document, StringField, IntField, DynamicDocument, connect
from pydantic import BaseModel, Field
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import OID, MongoModel


class ClowderFile(MongoModel):
    creator: PyObjectId = PyObjectId("000000000000000000000000")
    name: str = "_NA_"
    views: int = 0
    downloads: int = 0


class MongoFile(DynamicDocument):
    pass
