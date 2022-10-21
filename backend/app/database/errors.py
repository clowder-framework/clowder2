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
        resource: Optional[MongoDBRef],
        user: Optional[str],
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

    error_log = Error(message=message, trace=trace)
    # TODO: Is FastAPI able to understand Optional[...] and omit this, pass them in above?
    if resource:
        error_log.resource = resource
    if user:
        error_log.user = user

    await db["errors"].insert_one(error_log.to_mongo())
