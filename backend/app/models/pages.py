from typing import List, Union

from pydantic import BaseModel

from app.models.datasets import DatasetOut
from app.models.feeds import FeedOut
from app.models.files import FileOut
from app.models.groups import GroupOut
from app.models.listeners import EventListenerJobOut, EventListenerOut
from app.models.metadata import MetadataOut, MetadataDefinitionOut
from app.models.users import UserOut


class PageMetadata(BaseModel):
    total_count: int
    skip: int
    limit: int


class Paged(BaseModel):
    metadata: PageMetadata
    data: Union[List[DatasetOut], List[FileOut], List[GroupOut], List[UserOut], List[FeedOut],
    List[EventListenerJobOut], List[MetadataOut], List[MetadataDefinitionOut], List[EventListenerOut]]


def _get_page_query(skip, limit):
    return {"$facet":
        {
            "metadata": [{"$count": "total_count"}],
            "data": [{"$skip": skip}, {"$limit": limit}],
        },
    }
