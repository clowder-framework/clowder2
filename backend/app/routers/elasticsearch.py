import json

from fastapi import Depends
from fastapi.routing import APIRouter, Request

from app.keycloak_auth import get_optional_username
from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


def _add_permissions_clause(query, username: str):
    """Append filter to Elasticsearch object that restricts permissions based on the requesting user."""
    query_param = json.loads(query.decode().split("\n")[0])
    json_query = json.loads(query.decode().split("\n")[1])["query"]
    user_clause = {
        "bool": {
            "should": [
                {"term": {"creator": username}},
                {"term": {"user_ids": username}},
            ]
        }
    }
    if json_query == {"match_all": {}}:
        # Disallow a blank search, return no results if no query given.
        json_query = {"match_none": {}}
    json_query = {"query": {"bool": {"must": [user_clause, json_query]}}}
    query = f"{json.dumps(query_param)}\n{json.dumps(json_query)}\n".encode()
    return query


@router.put("/search", response_model=str)
async def search(index_name: str, query: str, username=Depends(get_optional_username)):
    es = await connect_elasticsearch()
    if username:
        query = _add_permissions_clause(query, username)
    return search_index(es, index_name, query)


@router.post("/all/_msearch")
async def msearch(
    request: Request,
    username=Depends(get_optional_username),
):
    es = await connect_elasticsearch()
    query = await request.body()
    if username:
        query = _add_permissions_clause(query, username)
        r = search_index(es, ["clowder"], query)
        return r
    else:
        return {}
