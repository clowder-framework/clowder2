from typing import Optional

from beanie import PydanticObjectId
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel


class OID(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        try:
            return ObjectId(str(v))
        except InvalidId:
            raise ValueError("Not a valid ObjectId")

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class MongoDBRef(BaseModel):
    collection: str
    resource_id: PydanticObjectId
    version: Optional[int]
