from datetime import datetime
from pydantic import Field
from app.models.mongomodel import MongoModel


class ExtractorIdentifier(MongoModel):
    name: str
    version: float = 1.0
    updated: datetime = Field(default_factory=datetime.utcnow)
    author: str


class ExtractorBase(ExtractorIdentifier):
    description: str = ""


class ExtractorIn(ExtractorBase):
    pass


class ExtractorDB(ExtractorBase):
    pass



class ExtractorOut(ExtractorDB):
    pass
