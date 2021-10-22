from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.models.mongomodel import MongoModel
from app.models.pyobjectid import PyObjectId


class NestedValue(BaseModel):
    parity: str
    value: int


class Item(MongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    price: float
    is_offer: Optional[bool] = None
    value: Optional[NestedValue] = None


# class Item(BaseModel):
#     id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
#     name: str
#     price: float
#     is_offer: Optional[bool] = None
#     value: Optional[NestedValue] = None
#
#     class Config:
#         allow_population_by_field_name = True
#         arbitrary_types_allowed = True
#         json_encoders = {
#             ObjectId: str,
#             PyObjectId: lambda x: ObjectId(x),
#             ObjectId: lambda oid: str(oid),
#         }
#
#     @classmethod
#     def from_mongo(cls, data: dict):
#         """We must convert _id into "id"."""
#         if not data:
#             return data
#         id = data.pop("_id", None)
#         return cls(**dict(data, id=id))
