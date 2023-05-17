from typing import Generator

import motor.motor_asyncio
import pika
from fastapi.exceptions import HTTPException
from minio import Minio
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig
from pika.adapters.blocking_connection import BlockingChannel
from pika.exchange_type import ExchangeType

from app.config import settings
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig
from app.search.connect import connect_elasticsearch


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
    """Client to connect to RabbitMQ for listeners/extractors interactions."""
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, credentials=credentials
    )
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    return channel


async def get_elasticsearchclient():
    es = await connect_elasticsearch()
    return es
