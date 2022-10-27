from datetime import datetime
from pydantic import Field, BaseModel
from typing import Optional, List, Union
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import MongoModel
from app.models.users import UserOut


class Repository(MongoModel):
    """Reference to a repository associated with Event Listener/Extractor."""

    repository_type: str = "git"
    repository_url: str = ""


class ExtractorInfo(BaseModel):
    """Currently for extractor_info JSON from Clowder v1 extractors for use with to /api/extractors endpoint."""

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
    """An Event Listener is the expanded version of v1 Extractors."""

    name: str
    version: str = "1.0"
    description: str = ""


class EventListenerIn(EventListenerBase):
    """On submission, minimum info for a listener is name, version and description. Clowder will use name and version to locate queue."""

    pass


class LegacyEventListenerIn(ExtractorInfo):
    """v1 Extractors can submit data formatted as a LegacyEventListener (i.e. v1 format) and it will be converted to a v2 EventListener."""

    name: str
    version: str = "1.0"
    description: str = ""


class EventListenerDB(EventListenerBase, MongoModel):
    """EventListeners have a name, version, author, description, and optionally properties where extractor_info will be saved."""

    author: str
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    properties: Optional[ExtractorInfo] = None


class EventListenerOut(EventListenerDB):
    pass


class FeedListener(BaseModel):
    """This is a shorthand POST class for associating an existing EventListener with a Feed. The automatic flag determines
    whether the Feed will automatically send new matches to the Event Listener."""

    listener_id: PyObjectId
    automatic: bool  # Listeners can trigger automatically or not on a per-feed basis.


class EventListenerMessage(BaseModel):
    """This describes contents of JSON object that is submitted to RabbitMQ for the Event Listeners/Extractors to consume."""

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
