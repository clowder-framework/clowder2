import os
from datetime import datetime
from typing import Optional, List

import motor.motor_asyncio
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, BaseConfig
from starlette import status
from starlette.responses import JSONResponse

app = FastAPI()

# mongo
client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
db = client.clowder


# Convert ObjectIds to strings before storing them as the _id
# See https://developer.mongodb.com/quickstart/python-quickstart-fastapi/
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class NestedValue(BaseModel):
    parity: str
    value: int


class Item(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    price: float
    is_offer: Optional[bool] = None
    value: Optional[NestedValue] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


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


class MongoModel(BaseModel):
    class Config(BaseConfig):
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            ObjectId: lambda oid: str(oid),
        }

    @classmethod
    def from_mongo(cls, data: dict):
        """We must convert _id into "id". """
        if not data:
            return data
        id = data.pop('_id', None)
        return cls(**dict(data, id=id))

    def mongo(self, **kwargs):
        exclude_unset = kwargs.pop('exclude_unset', True)
        by_alias = kwargs.pop('by_alias', True)

        parsed = self.dict(
            exclude_unset=exclude_unset,
            by_alias=by_alias,
            **kwargs,
        )

        # Mongo uses `_id` as default key. We should stick to that as well.
        if '_id' not in parsed and 'id' in parsed:
            parsed['_id'] = parsed.pop('id')

        return parsed


class User(MongoModel):
    id: OID = Field(default_factory=OID, alias="_id")
    name: str = Field()


@app.post('/user', response_model=User)
async def save_me(body: User):
    assert isinstance(body.id, ObjectId)
    res = await db["users"].insert_one(body.mongo())
    assert res.inserted_id == body.id

    found = await db["users"].find_one({'_id': res.inserted_id})
    return User.from_mongo(found)


@app.get("/user/{user_id}", response_model=User)
async def read_root(user_id: str):
    found = await db["items"].find_one({'_id': user_id})
    return User.from_mongo(found)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}", response_model=Item)
async def read_item(item_id: str, q: Optional[str] = None):
    if (item := await db["items"].find_one({"_id": item_id})) is not None:
        return item

    raise HTTPException(status_code=404, detail=f"Item {item_id} not found")


@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}


@app.post("/items", response_description="Add a new item", response_model=Item)
async def update_item(item: Item = Body(...)):
    item = jsonable_encoder(item)
    item_status = await db["items"].insert_one(item)
    created = await db["items"].find_one({"_id": item_status.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created)


@app.get("/items", response_description="List items", response_model=List[Item])
async def read_items(skip: int = 0, limit: int = 2):
    tasks = []
    for doc in await db["items"].find().skip(skip).limit(limit).to_list(length=limit):
        tasks.append(doc)
    return tasks
