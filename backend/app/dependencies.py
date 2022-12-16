from typing import Generator

import motor.motor_asyncio
import pika
from bson import ObjectId
from minio import Minio
from fastapi import Header, HTTPException, Depends
from pika.adapters.blocking_connection import BlockingChannel
from pika.exchange_type import ExchangeType
from pymongo import MongoClient

from app.config import settings
from minio.commonconfig import ENABLED
from minio.versioningconfig import VersioningConfig

from app.models.authorization import RoleType
from app.mongo import crete_mongo_indexes
from app.search.connect import connect_elasticsearch


class Authorization:
    """ We use class dependency so that we can provide the `permission` parameter to the dependency.
    For more info see https://fastapi.tiangolo.com/advanced/advanced-dependencies/."""
    def __init__(self, permission: str):
        self.permission = permission

    def __call__(self, dataset_id: str, current_user: str):
        if self.permission != "read":
            raise HTTPException(status_code=403, detail=f"User `{current_user} does not have `{self.permission}` permission on dataset {dataset_id}")
        else:
            return True

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


async def get_role(dataset_id: str, db: MongoClient = Depends(get_db)) -> RoleType:
    authorization = await db["authorization"].find_one({"_id": ObjectId(dataset_id)})
