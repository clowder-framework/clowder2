from datetime import datetime, timedelta
from pydantic import Field, BaseModel, AnyUrl
from typing import Optional, List, Union
from enum import Enum

from app.config import settings
from app.models.pyobjectid import PyObjectId
from app.models.mongomodel import MongoModel, MongoDBRef
from app.models.users import UserOut


class Repository(MongoModel):
    """Reference to a repository associated with Event Listener/Extractor."""

    repository_type: str = "git"
    repository_url: str = ""


class ExtractorInfo(BaseModel):
    """Currently for extractor_info JSON from Clowder v1 extractors for use with to /api/extractors endpoint."""

    author: Optional[
        str
    ]  # Referring to author of listener script (e.g. name or email), not Clowder user
    process: Optional[dict]
    maturity: str = "Development"
    name: Optional[str] = ""
    contributors: Optional[List[str]] = []
    contexts: Optional[List[Union[dict, AnyUrl]]] = []
    repository: Optional[List[Repository]] = []
    external_services: Optional[List[str]] = []
    libraries: Optional[List[str]] = []
    bibtex: Optional[List[str]] = []
    default_labels: Optional[List[str]] = []
    categories: Optional[List[str]] = []
    parameters: Optional[dict] = None
    version: Optional[str] = "1.0"


class EventListenerBase(BaseModel):
    """An Event Listener is the expanded version of v1 Extractors."""

    author: str = ""
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

    creator: Optional[UserOut] = None
    created: datetime = Field(default_factory=datetime.now)
    modified: datetime = Field(default_factory=datetime.now)
    properties: Optional[ExtractorInfo] = None


class EventListenerOut(EventListenerDB):
    pass


class EventListenerSubmit(BaseModel):
    name: str = ""


class FeedListener(BaseModel):
    """This is a shorthand POST class for associating an existing EventListener with a Feed. The automatic flag determines
    whether the Feed will automatically send new matches to the Event Listener."""

    listener_id: PyObjectId
    automatic: bool  # Listeners can trigger automatically or not on a per-feed basis.


class EventListenerJobStatus(str, Enum):
    """This is a basic status description of an extraction job for easier filtering of lists/views."""

    CREATED = "CREATED"
    STARTED = "STARTED"
    PROCESSING = "PROCESSING"
    SUCCEEDED = "SUCCEEDED"
    ERROR = "ERROR"
    SKIPPED = "SKIPPED"
    RESUBMITTED = "RESUBMITTED"


class EventListenerJob(MongoModel):
    """This summarizes a submission to an extractor. All messages from that extraction should include this job's ID."""

    listener_id: str
    resource_ref: MongoDBRef
    creator: UserOut
    parameters: Optional[dict] = None
    created: datetime = Field(default_factory=datetime.now)
    started: Optional[datetime] = None
    updated: Optional[datetime] = None
    finished: Optional[datetime] = None
    duration: Optional[float] = None
    latest_message: Optional[str] = None
    status: str = EventListenerJobStatus.CREATED

    class Config:
        # required for Enum to properly work
        use_enum_values = True


class EventListenerJobMessage(BaseModel):
    """This describes contents of JSON object that is submitted to RabbitMQ for the Event Listeners/Extractors to consume."""

    host: str = settings.API_HOST
    secretKey: str = "secretKey"
    retry_count: int = 0
    resource_type: str = "file"
    flags: str = ""
    filename: str
    fileSize: int
    id: str
    datasetId: str
    job_id: str


class EventListenerDatasetJobMessage(BaseModel):
    """This describes contents of JSON object that is submitted to RabbitMQ for the Event Listeners/Extractors to consume."""

    host: str = settings.API_HOST
    secretKey: str = "secretKey"
    retry_count: int = 0
    resource_type: str = "dataset"
    flags: str = ""
    datasetName: str
    id: str
    datasetId: str
    job_id: str


class EventListenerJobUpdate(MongoModel):
    """This is a status update message coming from the extractors back to Clowder."""

    job_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str
