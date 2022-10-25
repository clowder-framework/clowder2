from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import MongoModel
from app.models.users import UserOut


class Repository(MongoModel):
    repository_type: str = "git"
    repository_url: str = ""


# Currently for extractor_info JSON from Clowder v1 extractors POSTing to /api/extractors
class ExtractorInfo(BaseModel):
    author: str  # Referring to author of listener script (e.g. name or email), not Clowder user
    process: dict
    maturity: str = "Development"
    contributors: List[str] = []
    contexts: List[dict] = []
    repository: List[Repository] = []
    external_services: List[str] = []
    libraries: List[str] = []
    bibtex: List[str] = []
    default_labels: List[str] = []
    categories: List[str] = []
    parameters: List[dict] = []


class EventListenerBase(BaseModel):
    name: str
    version: int = 1
    description: str = ""


class EventListenerIn(EventListenerBase):
    pass


class LegacyEventListenerIn(ExtractorInfo):
    name: str
    version: str = "1.0"
    description: str = ""


class EventListenerDB(EventListenerBase, MongoModel):
    author: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    properties: Optional[ExtractorInfo] = None


class EventListenerOut(EventListenerDB):
    pass


class FeedListener(BaseModel):
    listener_id: PyObjectId
    automatic: bool  # Listeners can trigger automatically or not on a per-feed basis.


class EventListenerMessage(BaseModel):
    host: str = "http://127.0.0.1:8000"
    secretKey: str = "secretKey"
    retry_count: int = 0
    resource_type: str = "file"
    flags: str = ""
    filename: str
    fileSize: int
    id: str
    datasetId: str
    token: str
