from fastapi.routing import APIRouter, Request

from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.put("/search", response_model=str)
async def search(index_name: str, query: str):
    es = connect_elasticsearch()
    return search_index(es, index_name, query)


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


@router.post("/_msearch")
async def search_file_and_dataset(request: Request):
    es = connect_elasticsearch()
    query = await request.body()
    return search_index(es, ["file", "dataset"], query)
