from pydantic import BaseModel

from app.config import settings


class Status(BaseModel):
    version: str = settings.version