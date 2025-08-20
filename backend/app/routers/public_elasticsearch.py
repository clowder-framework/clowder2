import json

from app.config import settings
from app.search.connect import connect_elasticsearch, search_index
from fastapi.routing import APIRouter, Request

router = APIRouter()


def _add_public_clause(query):
    """Append filter to Elasticsearch object that restricts permissions based on the requesting user."""
    # TODO: Add public filter once added
    public_clause = {"bool": {"should": [{"term": {"status": "public"}}]}}

    updated_query = ""
    for content in query.decode().split("\n"):
        # Query can have multiple clauses separated by \n for things like aggregates, reactivesearch GUI queries
        if len(content) == 0:
            continue  # last line
        json_content = json.loads(content)
        if "query" in json_content:
            json_content["query"] = {
                "bool": {"must": [public_clause, json_content["query"]]}
            }
        updated_query += json.dumps(json_content) + "\n"
    return updated_query.encode()


@router.put("/search", response_model=str)
async def search(index_name: str, query: str):
    es = await connect_elasticsearch()
    query = _add_public_clause(query)
    return search_index(es, index_name, query)


@router.post("/all/_msearch")
async def msearch(request: Request):
    es = await connect_elasticsearch()
    query = await request.body()
    query = _add_public_clause(query)
    r = search_index(es, [settings.elasticsearch_index], query)
    return r
