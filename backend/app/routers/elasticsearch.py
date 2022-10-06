from fastapi.routing import APIRouter

from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.put("/search", response_model=str)
async def search(index_name: str, query: str):
    es = connect_elasticsearch()
    return search_index(es, index_name, query)
