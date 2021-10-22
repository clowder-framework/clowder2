import os
import motor
from motor.motor_asyncio import AsyncIOMotorClient

MongoClient = motor.motor_asyncio.AsyncIOMotorClient(
    os.getenv("MONGODB_URL", "mongodb://localhost:27017")
)
