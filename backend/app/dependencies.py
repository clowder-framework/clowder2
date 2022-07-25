from typing import Generator

import motor.motor_asyncio
import pika
from minio import Minio
from fastapi import Header, HTTPException
from pika.adapters.blocking_connection import BlockingChannel
from pika.exchange_type import ExchangeType

from app.config import settings
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig
from app.mongo import crete_mongo_indexes


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
    await crete_mongo_indexes(db)
    yield db


async def get_fs() -> Generator:
    file_system = Minio(
        settings.MINIO_SERVER_URL,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )
    clowder_bucket = settings.MINIO_BUCKET_NAME
    if not file_system.bucket_exists(clowder_bucket):
        file_system.make_bucket(clowder_bucket)
    file_system.set_bucket_versioning(clowder_bucket, VersioningConfig(ENABLED))
    yield file_system


def get_rabbitmq() -> BlockingChannel:
    credentials = pika.PlainCredentials("guest", "guest")
    parameters = pika.ConnectionParameters("localhost", credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.exchange_declare(
        exchange="test_exchange",
        exchange_type=ExchangeType.direct,
        passive=False,
        durable=True,
        auto_delete=False,
    )
    channel.queue_declare(queue="standard_key")
    return channel
