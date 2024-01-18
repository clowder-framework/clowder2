from typing import List, Union

from pydantic import BaseModel

from app.models.datasets import DatasetOut
from app.models.files import FileOut


class PageMetadata(BaseModel):
    total_count: int
    skip: int
    limit: int


class Paged(BaseModel):
    metadata: PageMetadata
    data: Union[List[DatasetOut], List[FileOut]]


def _get_page_query(skip, limit):
    return {"$facet":
        {
            "metadata": [{"$count": "total_count"}],
            "data": [{"$skip": skip}, {"$limit": limit}],
        },
    }
