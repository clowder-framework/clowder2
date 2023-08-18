import json

from fastapi import Depends
from fastapi.routing import APIRouter, Request

from app.keycloak_auth import get_current_username
from app.search.connect import connect_elasticsearch, search_index

router = APIRouter()


def _add_permissions_clause(query, username: str):
    """Append filter to Elasticsearch object that restricts permissions based on the requesting user."""
    # TODO: Add public filter once added
    user_clause = {
        "bool": {
            "should": [
                {"term": {"creator": username}},
                {"term": {"user_ids": username}},
            ]
        }
    }

    updated_query = ""
    for content in query.decode().split("\n"):
        # Query can have multiple clauses separated by \n for things like aggregates, reactivesearch GUI queries
        if len(content) == 0:
            continue  # last line
        json_content = json.loads(content)
        if "query" in json_content:
            json_content["query"] = {
                "bool": {"must": [user_clause, json_content["query"]]}
            }
        updated_query += json.dumps(json_content) + "\n"
    return updated_query.encode()


@router.put("/search", response_model=str)
async def search(index_name: str, query: str, username=Depends(get_current_username)):
    es = await connect_elasticsearch()
    query = _add_permissions_clause(query, username)
    return search_index(es, index_name, query)


@router.post("/all/_msearch")
async def msearch(
    request: Request,
    username=Depends(get_current_username),
):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_permissions_clause(query, username)
    r = search_index(es, ["clowder"], query)
    return r
