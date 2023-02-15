import logging
import traceback
import motor.motor_asyncio
from typing import Optional, Generator
from fastapi import Depends
from pymongo import MongoClient

from app.config import settings
from app.mongo import create_mongo_indexes
from app.models.errors import Error
from app.models.mongomodel import MongoDBRef

logger = logging.getLogger(__name__)


async def _get_db() -> Generator:
    """Duplicate of app.dependencies.get_db(), but importing that causes circular import."""
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]
    await create_mongo_indexes(db)
    yield db


async def log_error(
    exception: Exception,
    resource: Optional[MongoDBRef] = None,
    user: Optional[str] = None,
):
    """Insert new Error into the database.

    Arguments:
        exception -- instance of an Exception or subclass
        resource -- if error relates to a specific resource, you can include it
        user --- if error relates to actions performed by a user, you can include them
    """
    db = _get_db()
    message = str(exception)
    trace = traceback.format_exc(exception, limit=4)

    logger.error(message)
    error_log = Error(message=message, trace=trace, resource=resource, user=user)
    await db["errors"].insert_one(error_log.to_mongo())
