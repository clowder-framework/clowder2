from typing import Generator

import motor.motor_asyncio
import pika
from minio import Minio
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig
from pika.adapters.blocking_connection import BlockingChannel
from pika.exchange_type import ExchangeType

from app.config import settings
from app.mongo import crete_mongo_indexes
from app.search.connect import connect_elasticsearch


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


async def get_elasticsearchclient():
    es = await connect_elasticsearch()
    return es



