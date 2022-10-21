from datetime import datetime
from typing import Optional
from pydantic import Field

from app.models.mongomodel import MongoModel
from app.models.metadata import MongoDBRef


class ServiceUnreachable(Exception):
    """Raised when Clowder can't connect to an outside service e.g. MongoDB, Elasticsearch."""
    def __init__(self, service, *args):
        super().__init__(args)
        self.service = service

    def __str__(self):
        return f'{self.service} could not be reached.'


class Error(MongoModel):
    message: str  # Shorthand message of the error
    trace: str  # Full stack trace of the error
    resource: Optional[MongoDBRef]
    user_id: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
