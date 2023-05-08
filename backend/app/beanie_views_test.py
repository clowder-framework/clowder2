"""TEMPORARY FILE TO TEST BEANIE. WILL DELETE."""
import asyncio
from datetime import timedelta
from typing import Optional

from beanie import Document, init_beanie, Indexed
from beanie import View
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

from app.models.authorization import AuthorizationDB
from app.models.datasets import DatasetDBViewList, DatasetDB


class Category(BaseModel):
    name: str
    description: str


class Product(Document):
    name: str                          # You can use normal types just like in pydantic
    description: Optional[str] = None
    price: Indexed(float)              # You can also specify that a field should correspond to an index
    category: Category                 # You can include pydantic models as well


class Bike(Document):
    type: str
    frame_size: int
    is_new: bool


class Metrics(View):
    type: str = Field(alias="_id")
    number: int
    new: int

    class Settings:
        source = Bike
        pipeline = [
            {
                "$group": {
                    "_id": "$type",
                    "number": {"$sum": 1},
                    "new": {"$sum": {"$cond": ["$is_new", 1, 0]}}
                }
            },
        ]


# This is an asynchronous example, so we will access it from an async function
async def example():
    # Beanie uses Motor async client under the hood
    client = AsyncIOMotorClient("mongodb://localhost:27017/beanie")

    # Initialize beanie with the Product document class
    # await init_beanie(database=client.beanie, document_models=[Product, Bike, Metrics, DatasetDBViewList], recreate_views=True,)
    await init_beanie(database=client.clowder2, document_models=[DatasetDB, DatasetDBViewList, AuthorizationDB], recreate_views=True,)

    # chocolate = Category(name="Chocolate", description="A preparation of roasted and ground cacao seeds.")
    # # Beanie documents work just like pydantic models
    # tonybar = Product(name="Tony's", price=5.95, category=chocolate)
    # # And can be inserted into the database
    # await tonybar.insert()
    #
    # # You can find documents with pythonic syntax
    # product = await Product.find_one(Product.price < 10)
    #
    # # And update them
    # await product.set({Product.name: "Gold bar"})
    #
    # await Bike(type="Mountain", frame_size=54, is_new=True).insert()
    # await Bike(type="Mountain", frame_size=60, is_new=False).insert()
    # await Bike(type="Road", frame_size=52, is_new=True).insert()
    # await Bike(type="Road", frame_size=54, is_new=True).insert()
    # await Bike(type="Road", frame_size=58, is_new=False).insert()
    #
    # results = await Metrics.find(Metrics.type == "Road").to_list()
    # print(results)

    results = await DatasetDBViewList.find(DatasetDBViewList.author.email == "lmarini@illinois.edu").to_list()
    print(results)

if __name__ == "__main__":
    asyncio.run(example())