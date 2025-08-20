from app.config import settings
from pydantic import BaseModel


class Status(BaseModel):
    version: str = settings.version
