from datetime import datetime
from typing import Optional

from app.models.mongomodel import MongoDBRef
from beanie import Document
from pydantic import BaseModel, Field


class ServiceUnreachable(Exception):
    """Raised when Clowder can't connect to an outside service e.g. MongoDB, Elasticsearch."""

    def __init__(self, service, *args):
        super().__init__(args)
        self.service = service

    def __str__(self):
        return f"{self.service} could not be reached."


class Error(BaseModel):
    message: str  # Shorthand message of the error
    trace: str  # Full stack trace of the error
    resource: Optional[MongoDBRef] = None
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorDB(Document, Error):
    class Settings:
        name = "errors"
