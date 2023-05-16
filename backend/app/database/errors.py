import logging
import traceback
from typing import Optional, Generator

import motor.motor_asyncio

from app.config import settings
from app.models.errors import ErrorDB
from app.models.mongomodel import MongoDBRef

logger = logging.getLogger(__name__)


async def _get_db() -> Generator:
    """Duplicate of app.dependencies.get_db(), but importing that causes circular import."""
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]
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
    error_log = ErrorDB(message=message, trace=trace, resource=resource, user=user)
    await error_log.insert()
