from fastapi.routing import APIRouter, Request

from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


@router.put("/search", response_model=str)
async def search(index_name: str, query: str):
    es = await connect_elasticsearch()
    return search_index(es, index_name, query)


@router.post("/file/_msearch")
async def search_file(request: Request):
    es = await connect_elasticsearch()
    query = await request.body()
    return search_index(es, "file", query)


@router.post("/dataset/_msearch")
async def search_dataset(request: Request):
    es = await connect_elasticsearch()
    query = await request.body()
    return search_index(es, "dataset", query)


@router.post("/metadata/_msearch")
async def search_metadata(request: Request):
    es = await connect_elasticsearch()
    query = await request.body()
    return search_index(es, "metadata", query)


@router.post("/file,dataset,metadata/_msearch")
async def search_file_dataset_and_metadata(request: Request):
    es = await connect_elasticsearch()
    query = await request.body()
    r = search_index(es, ["file", "dataset", "metadata"], query)
    return r
