from pydantic import Field
from typing import Optional
import os
from bson import ObjectId
from mongoengine import Document, StringField, IntField, DynamicDocument, connect
from pydantic import BaseModel, Field
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import OID, MongoModel
from passlib.context import CryptContext
from mongoengine import connect

DATABASE_URI = "mongodb://127.0.0.1:27017"
db = DATABASE_URI + "/clowder"
connect(host=db)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(MongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field()
    hashed_password: str = Field()

    def verify_password(self, password):
        return pwd_context.verify(password, self.hashed_password)


class AuthDetails(BaseModel):
    name: str
    password: str
