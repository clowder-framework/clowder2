from pydantic import BaseModel


class PageMetadata(BaseModel):
    total_count: int = 0
    skip: int = 0
    limit: int = 0


class Paged(BaseModel):
    metadata: PageMetadata
    # order matters pydantic will match the first type that matches
    # data: Union[List[FileOut], List[DatasetOut], List[GroupOut], List[UserOut], List[FeedOut],
    # List[EventListenerJobOut], List[MetadataOut], List[MetadataDefinitionOut], List[EventListenerOut]]
    data: list = []


def _get_page_query(skip, limit):
    return {"$facet":
        {
            "metadata": [{"$count": "total_count"}],
            "data": [{"$skip": skip}, {"$limit": limit}],
        },
    }
