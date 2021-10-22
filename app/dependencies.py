import os
from typing import Generator

import motor
from fastapi import Header, HTTPException


async def get_token_header(x_token: str = Header(...)):
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def get_query_token(token: str):
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")


async def get_db() -> Generator:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
        os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    )
    db = mongo_client.clowder
    yield db
