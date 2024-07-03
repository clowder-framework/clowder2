from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class Favorite(BaseModel):
    """A Favorite is a saved resource that a user has marked as a favorite."""

    resource_id: str
    resource_type: str
    name: str
    description: str = ""
    creator: EmailStr
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
