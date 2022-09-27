import logging

from elasticsearch import Elasticsearch
from elasticsearch import BadRequestError

from app.config import settings

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
