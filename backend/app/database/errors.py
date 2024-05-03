import logging
import traceback
from typing import Optional

from app.models.errors import ErrorDB
from app.models.mongomodel import MongoDBRef

logger = logging.getLogger(__name__)


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
    message = str(exception)
    trace = traceback.format_exc(exception, limit=4)

    logger.error(message)
    error_log = ErrorDB(message=message, trace=trace, resource=resource, user=user)
    await error_log.insert()
