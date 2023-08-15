import json

from fastapi import Depends
from fastapi.routing import APIRouter, Request

from app.keycloak_auth import get_current_user
from app.models.users import UserOut
from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


def _add_permissions_clause(query, user: UserOut):
    """Append filter to Elasticsearch object that restricts permissions based on the requesting user."""
    query_param = json.loads(query.decode().split("\n")[0])
    json_query = json.loads(query.decode().split("\n")[1])
    user_clause = {
        "bool": {
            "should": [
                {"term": {"creator": user.email}},
                {"term": {"user_ids": user.email}},
            ]
        }
    }
    json_query = {"query": {"bool": {"must": [user_clause, json_query["query"]]}}}
    query = f"{json.dumps(query_param)}\n{json.dumps(json_query)}\n".encode()
    return query


@router.put("/search", response_model=str)
async def search(index_name: str, query: str, user=Depends(get_current_user)):
    es = await connect_elasticsearch()
    query = _add_permissions_clause(query, user)
    return search_index(es, index_name, query)


@router.post("/file/_msearch")
async def search_file(
    request: Request,
    user=Depends(get_current_user),
):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_permissions_clause(query, user)
    return search_index(es, "file", query)


@router.post("/dataset/_msearch")
async def search_dataset(
    request: Request,
    user=Depends(get_current_user),
):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_permissions_clause(query, user)
    return search_index(es, "dataset", query)


@router.post("/metadata/_msearch")
async def search_metadata(
    request: Request,
    user=Depends(get_current_user),
):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_permissions_clause(query, user)
    return search_index(es, "metadata", query)


@router.post("/file,dataset,metadata/_msearch")
async def search_file_dataset_and_metadata(
    request: Request,
    user=Depends(get_current_user),
):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_permissions_clause(query, user)
    r = search_index(es, ["file", "dataset", "metadata"], query)
    return r
