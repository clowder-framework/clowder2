from typing import Generator

import motor.motor_asyncio
from minio import Minio
from fastapi import Header, HTTPException
from app.config import settings


async def get_token_header(x_token: str = Header(...)):
    # Not currently used. Here as an example.
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def get_query_token(token: str):
    # Not currently used. Here as an example.
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")


async def get_db() -> Generator:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]
    yield db


async def get_fs() -> Generator:
    # TODO: Look at FastAPI configuration files instead of this
    file_system = Minio(
        settings.MINIO_SERVER_URL,
        access_key=settings.MINIO_ACCESS_KEY,  # minioadmin as default?
        secret_key=settings.MINIO_SECRET_KEY,  # minioadmin
        secure=False,
    )
    clowder_bucket = settings.MINIO_BUCKET_NAME
    if not file_system.bucket_exists(clowder_bucket):
        file_system.make_bucket(clowder_bucket)
    yield file_system
