import logging

from elasticsearch import Elasticsearch
from elasticsearch import BadRequestError

from app.config import settings
from app.models.search import SearchIndexContents, SearchCriteria, SearchObject


logger = logging.getLogger(__name__)
no_of_shards = settings.elasticsearch_no_of_shards
no_of_replicas = settings.elasticsearch_no_of_replicas


# To confirm if it can connect to elastic_search serevr
def connect_elasticsearch():
    _es = None
    logger.info(settings.elasticsearch_url)
    _es = Elasticsearch(settings.elasticsearch_url)
    if _es.ping():
        logger.info("Successfully connected to Elasticsearch")
    else:
        logger.info("Can not connect to Elasticsearch")
    return _es


# Create index
def create_index(es_client, index_name):
    created = False
    # index settings
    settings = {
        "settings": {
            "number_of_shards": no_of_shards,
            "number_of_replicas": no_of_replicas,
        },
        "mappings": {
            "properties": {
                "name": {"type": "text"},
                "created": {"type": "date"},
                "creator": {"type": "text"},
                "download": {"type": "long"},
            }
        },
    }

    try:
        if not es_client.indices.exists(index=index_name):
            es_client.indices.create(index=index_name, settings=settings)
            logger.info("Created Index")
            created = True
    except BadRequestError as ex:
        logger.error(str(ex))
    finally:
        return created


# Insert a record
def insert_record(es_client, index_name, doc):
    try:
        es_client.index(index=index_name, document=doc)
    except BadRequestError as ex:
        logger.error(str(ex))


# Search
def search_index(es_client, index_name, query):
    try:
        res = es_client.search(index=index_name, query=query)
        logger.info("Got %d Hits:" % res["hits"]["total"]["value"])
        return res
    except BadRequestError as ex:
        logger.error(str(ex))


# Delete an index
def delete_index(es_client, index_name):
    try:
        es_client.options(ignore_status=[400, 404]).indices.delete(index=index_name)
    except BadRequestError as ex:
        logger.error(str(ex))


# Convert SearchObject into an Elasticsearch JSON object and perform search
def execute_search_obj(es_client, search_obj: SearchObject):
    match_list = []

    # TODO: This will need to be more complex to support other operators
    for criteria in search_obj.criteria:
        crit = {criteria.field: criteria.value}
        match_list.append({"match": crit})

    if search_obj.mode == "and":
        query = {"bool": {"must": match_list}}
    if search_obj.mode == "or":
        query = {"bool": {"should": match_list}}

    print(query)
    return search_index(es_client, search_obj.index_name, query)


# Verify a search for provided criteria returns resource with match_id
def verify_match(es_client, new_index: SearchIndexContents, search_obj: SearchObject):
    # TODO: There is an opportunity here to do some basic checks here first, without talking to elasticsearch
    search_obj.criteria.insert(0, SearchCriteria(field="id", value=new_index.id))
    results = execute_search_obj(es_client, search_obj)
    return len(results) > 0
