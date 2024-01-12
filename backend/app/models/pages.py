from pydantic import BaseModel


class PageMetadata(BaseModel):
    total_count: int
    skip: int
    limit: int


class Paged(BaseModel):
    metadata: PageMetadata
    data: list


def _get_page_query(skip, limit):
    return {"$facet":
        {
            "metadata": [{"$count": "total_count"}],
            "data": [{"$skip": skip}, {"$limit": limit}],
        },
    }
