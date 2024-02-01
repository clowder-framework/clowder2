from beanie.odm.enums import SortDirection
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


def _get_page_query(
    skip, limit, sort_field="created", ascending=True, sort_clause=None
):
    if sort_clause is not None:
        return {
            "$facet": {
                "metadata": [{"$count": "total_count"}],
                "data": [
                    sort_clause,
                    {"$skip": skip},
                    {"$limit": limit},
                ],
            },
        }
    else:
        return {
            "$facet": {
                "metadata": [{"$count": "total_count"}],
                "data": [
                    {
                        "$sort": {
                            sort_field: SortDirection.ASCENDING
                            if ascending
                            else SortDirection.DESCENDING
                        }
                    },
                    {"$skip": skip},
                    {"$limit": limit},
                ],
            },
        }
