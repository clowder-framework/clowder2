import logging
from typing import AsyncGenerator

import boto3
import pika
import aio_pika
from aio_pika.abc import AbstractChannel

from app.config import settings
from app.search.connect import connect_elasticsearch
from minio import Minio
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig
from pika.adapters.blocking_connection import BlockingChannel

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


async def get_fs() -> AsyncGenerator[Minio, None]:
    # Either use AWS Identity and Access Management (IAM) to connect to S3 or connect to Minio server
    if settings.AWS_IAM:
        logger.debug("AWS IAM enabled for s3 authentication")
        session = boto3.Session()
        credentials = session.get_credentials()
        credentials = credentials.get_frozen_credentials()
        file_system = Minio(
            settings.MINIO_EXTERNAL_SERVER_URL,
            access_key=credentials.access_key,
            secret_key=credentials.secret_key,
            session_token=credentials.token,
            secure=settings.MINIO_SECURE.lower() == "true",
        )
    else:
        logger.debug("Local MinIO authentication")
        file_system = Minio(
            settings.MINIO_EXTERNAL_SERVER_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE.lower() == "true",
        )
    clowder_bucket = settings.MINIO_BUCKET_NAME
    if not file_system.bucket_exists(clowder_bucket):
        file_system.make_bucket(clowder_bucket)
    file_system.set_bucket_versioning(clowder_bucket, VersioningConfig(ENABLED))
    yield file_system


# This will be needed for generating presigned URL for sharing
async def get_external_fs() -> AsyncGenerator[Minio, None]:
    # Either use AWS Identity and Access Management (IAM) to connect to S3 or connect to Minio server
    if settings.AWS_IAM:
        logger.debug("AWS IAM enabled for s3 authentication")
        session = boto3.Session()
        credentials = session.get_credentials()
        credentials = credentials.get_frozen_credentials()
        file_system = Minio(
            settings.MINIO_EXTERNAL_SERVER_URL,
            access_key=credentials.access_key,
            secret_key=credentials.secret_key,
            session_token=credentials.token,
            secure=settings.MINIO_SECURE.lower() == "true",
        )
    else:
        logger.debug("Local MinIO authentication")
        file_system = Minio(
            settings.MINIO_EXTERNAL_SERVER_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE.lower() == "true",
        )
    clowder_bucket = settings.MINIO_BUCKET_NAME
    logger.debug("Connecting to bucket %s", clowder_bucket)
    if not file_system.bucket_exists(clowder_bucket):
        file_system.make_bucket(clowder_bucket)
    file_system.set_bucket_versioning(clowder_bucket, VersioningConfig(ENABLED))
    yield file_system


async def get_rabbitmq() -> AbstractChannel:
    """Client to connect to RabbitMQ for listeners/extractors interactions."""
    RABBITMQ_URL = f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASS}@{settings.RABBITMQ_HOST}/"

    logger.debug("Connecting to rabbitmq at %s", settings.RABBITMQ_HOST)
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    channel = await connection.channel()

    print(f"DEBUG: get_rabbitmq() called. Returning channel of type: {type(channel)}")
    return channel


# Keep the old function for compatibility if needed
def get_blocking_rabbitmq() -> BlockingChannel:
    """Legacy blocking RabbitMQ client (for extractors that need it)"""
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, credentials=credentials
    )
    connection = pika.BlockingConnection(parameters)
    return connection.channel()


async def get_elasticsearchclient():
    es = await connect_elasticsearch()
    return es
