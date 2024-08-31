from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

import pymongo
from app.config import settings
from app.models.authorization import AuthorizationDB
from app.models.mongomodel import MongoDBRef
from app.models.users import UserOut
from beanie import Document, PydanticObjectId, View
from pydantic import AnyUrl, BaseModel, Field


class Repository(BaseModel):
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
    unique_key: Optional[str] = None


class AccessList(BaseModel):
    """Container object for lists of user emails/group IDs/dataset IDs that can submit to listener.
    The singular owner is the primary who can modify other lists."""

    owner: str
    users: List[str] = []
    groups: List[PydanticObjectId] = []
    datasets: List[PydanticObjectId] = []


class EventListenerBase(BaseModel):
    """An Event Listener is the expanded version of v1 Extractors."""

    name: str
    version: str = "1.0"
    description: str = ""
    access: Optional[AccessList] = None


class EventListenerIn(EventListenerBase):
    """On submission, minimum info for a listener is name, version and description. Clowder will use name and version to locate queue."""

    pass


class LegacyEventListenerIn(ExtractorInfo):
    """v1 Extractors can submit data formatted as a LegacyEventListener (i.e. v1 format) and it will be converted to a v2 EventListener."""

    name: str
    version: str = "1.0"
    description: str = ""


class EventListenerDB(Document, EventListenerBase):
    """EventListeners have a name, version, author, description, and optionally properties where extractor_info will be saved."""

    creator: Optional[UserOut] = None
    created: datetime = Field(default_factory=datetime.now)
    modified: datetime = Field(default_factory=datetime.now)
    lastAlive: datetime = None
    alive: Optional[bool] = None
    active: bool = False
    properties: Optional[ExtractorInfo] = None

    class Settings:
        name = "listeners"
        indexes = [
            [
                ("name", pymongo.TEXT),
                ("description", pymongo.TEXT),
            ],
        ]


class EventListenerOut(EventListenerDB):
    class Config:
        fields = {"id": "id"}


class EventListenerSubmit(BaseModel):
    name: str = ""


class FeedListener(BaseModel):
    """This is a shorthand POST class for associating an existing EventListener with a Feed. The automatic flag determines
    whether the Feed will automatically send new matches to the Event Listener."""

    listener_id: PydanticObjectId
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


class EventListenerJobBase(BaseModel):
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


class EventListenerJobDB(Document, EventListenerJobBase):
    """This summarizes a submission to an extractor. All messages from that extraction should include this job's ID."""

    class Settings:
        name = "listener_jobs"
        indexes = [
            [
                ("resource_ref.resource_id", pymongo.TEXT),
                ("listener_id", pymongo.TEXT),
                ("status", pymongo.TEXT),
            ]
        ]


class EventListenerJobOut(EventListenerJobDB):
    class Config:
        fields = {"id": "id"}


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
    parameters: Optional[dict] = None


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
    parameters: Optional[dict] = None


class EventListenerJobUpdateBase(BaseModel):
    """This is a status update message coming from the extractors back to Clowder."""

    job_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str


class EventListenerJobUpdateDB(Document, EventListenerJobUpdateBase):
    class Settings:
        name = "listener_job_updates"
        indexes = [
            [
                ("job_id", pymongo.TEXT),
                ("status", pymongo.TEXT),
            ],
        ]


class EventListenerJobUpdateOut(EventListenerJobUpdateDB):
    class Config:
        fields = {"id": "id"}


class EventListenerJobViewList(View, EventListenerJobBase):
    """Get associated resource information for each job"""

    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]

    class Settings:
        source = EventListenerJobDB
        name = "listener_jobs_view"
        pipeline = [
            {
                "$facet": {
                    "extraction_on_dataset": [
                        {"$match": {"resource_ref.collection": {"$eq": "datasets"}}},
                        {
                            "$lookup": {
                                "from": "authorization",
                                "localField": "resource_ref.resource_id",
                                "foreignField": "dataset_id",
                                "as": "auth",
                            }
                        },
                    ],
                    "extraction_on_file": [
                        {"$match": {"resource_ref.collection": {"$eq": "files"}}},
                        {
                            "$lookup": {
                                "from": "files",
                                "localField": "resource_ref.resource_id",
                                "foreignField": "_id",
                                "as": "file_details",
                            }
                        },
                        {
                            "$lookup": {
                                "from": "authorization",
                                "localField": "file_details.dataset_id",
                                "foreignField": "dataset_id",
                                "as": "auth",
                            }
                        },
                    ],
                }
            },
            {
                "$project": {
                    "all": {
                        "$concatArrays": [
                            "$extraction_on_dataset",
                            "$extraction_on_file",
                        ]
                    }
                }
            },
            {"$unwind": "$all"},
            {"$replaceRoot": {"newRoot": "$all"}},
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5


class EventListenerJobUpdateViewList(View, EventListenerJobUpdateBase):
    """Get associated resource information for each job update"""

    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    auth: List[AuthorizationDB]

    class Settings:
        source = EventListenerJobUpdateDB
        name = "listener_job_updates_view"
        pipeline = [
            {
                "$lookup": {  # Equality Match
                    "from": "listener_jobs",
                    "localField": "job_id",
                    "foreignField": "_id",
                    "as": "listener_job_details",
                }
            },
            {
                "$facet": {
                    "extraction_on_dataset": [
                        {
                            "$match": {
                                "listener_job_details.resource_ref.collection": {
                                    "$eq": "datasets"
                                }
                            }
                        },
                        {
                            "$lookup": {
                                "from": "authorization",
                                "localField": (
                                    "listener_job_details.resource_ref.resource_id"
                                ),
                                "foreignField": "dataset_id",
                                "as": "auth",
                            }
                        },
                    ],
                    "extraction_on_file": [
                        {
                            "$match": {
                                "listener_job_details.resource_ref.collection": {
                                    "$eq": "files"
                                }
                            }
                        },
                        {
                            "$lookup": {
                                "from": "files",
                                "localField": (
                                    "listener_job_details.resource_ref.resource_id"
                                ),
                                "foreignField": "_id",
                                "as": "file_details",
                            }
                        },
                        {
                            "$lookup": {
                                "from": "authorization",
                                "localField": "file_details.dataset_id",
                                "foreignField": "dataset_id",
                                "as": "auth",
                            }
                        },
                    ],
                }
            },
            {
                "$project": {
                    "all": {
                        "$concatArrays": [
                            "$extraction_on_dataset",
                            "$extraction_on_file",
                        ]
                    }
                }
            },
            {"$unwind": "$all"},
            {"$replaceRoot": {"newRoot": "$all"}},
        ]
        # Needs fix to work https://github.com/roman-right/beanie/pull/521
        # use_cache = True
        # cache_expiration_time = timedelta(seconds=10)
        # cache_capacity = 5
