from fastapi.routing import APIRouter, Request

from app.elastic_search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.post("/file/_msearch")
async def search_file(request: Request):
    es = connect_elasticsearch()
    query = await request.body()
    return search_index(es, "file", query)


@router.post("/dataset/_msearch")
async def search_dataset(request: Request):
    es = connect_elasticsearch()
    query = await request.body()
    return search_index(es, "dataset", query)
