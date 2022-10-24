import logging
import traceback
from typing import Optional
from fastapi import Depends
from pymongo import MongoClient

from app import dependencies
from app.models.errors import Error
from app.models.metadata import MongoDBRef

logger = logging.getLogger(__name__)


async def log_error(
    exception: Exception,
    resource: Optional[MongoDBRef] = None,
    user: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
):
    """Insert new Error into the database.

    Arguments:
        module -- module name e.g. __import__(__name__)
        method --
    """
    message = str(exception)
    trace = traceback.format_exc(exception, limit=4)

    logger.error(message)
    error_log = Error(message=message, trace=trace, resource=resource, user=user)
    await db["errors"].insert_one(error_log.to_mongo())
