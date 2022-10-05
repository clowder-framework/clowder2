from fastapi.routing import APIRouter

from app.elastic_search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.post("/file/_msearch", response_model=str)
async def search_file(query: str):
    es = connect_elasticsearch()
    return search_index(es, "file", query)


@router.post("/dataset/_msearch", response_model=str)
async def search_dataset(query: str):
    es = connect_elasticsearch()
    return search_index(es, "dataset", query)
