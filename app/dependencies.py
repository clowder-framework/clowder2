import os
from typing import Generator

import motor
from minio import Minio
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
    db = mongo_client[os.getenv("CLOWDER_DATABASE", "clowder2")]
    yield db


async def get_fs() -> Generator:
    # TODO: Look at FastAPI configuration files instead of this
    file_system = Minio(
        os.getenv("MINIO_SERVER_URL", "localhost:9001"),
        access_key=os.getenv("MINIO_ACCESS_KEY", "clowder"),  # minioadmin as default?
        secret_key=os.getenv(
            "MINIO_SECRET_KEY",
            "clowdersecret",
        ),  # minioadmin
        secure=False,
    )
    clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")
    if not file_system.bucket_exists(clowder_bucket):
        file_system.make_bucket(clowder_bucket)
    yield file_system
