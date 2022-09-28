from fastapi.routing import APIRouter

from app.elastic_search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.put("/search", response_model=str)
async def update_file(index_name: str, query: str):
    es = connect_elasticsearch()
    return search_index(es, index_name, query)
