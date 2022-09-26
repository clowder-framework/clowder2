import logging

from elasticsearch import Elasticsearch
from elasticsearch import BadRequestError

from app.config import settings

logger = logging.getLogger(__name__)
no_of_shards = settings.elasticsearch_no_of_shards
no_of_replicas = settings.elasticsearch_no_of_replicas


""" To connect to elasticsearch server and return the elasticsearch client """


def connect_elasticsearch():
    _es = None
    logger.info(settings.elasticsearch_url)
    _es = Elasticsearch(settings.elasticsearch_url)
    if _es.ping():
        logger.info("Successfully connected to Elasticsearch")
    else:
        logger.info("Can not connect to Elasticsearch")
    return _es


""" Generate an index in elasticsearch
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to create (Index in elasticsearch is synonymous to table in SQL)
        settings -- schema of the index with additional details
        (For more details, refer to https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)
"""


def create_index(es_client, index_name, settings):
    created = False

    try:
        if not es_client.indices.exists(index=index_name):
            es_client.indices.create(index=index_name, body=settings)
            logger.info("Created Index")
            created = True
    except BadRequestError as ex:
        logger.error(str(ex))
    finally:
        return created


""" Add a document to the index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index 
        doc -- document you want to put in the index (It's similar to a record in SQL)
        id -- unique key by which you can identify the document when needed
"""


def insert_record(es_client, index_name, doc, id):
    try:
        es_client.index(index=index_name, document=doc, id=id)
    except BadRequestError as ex:
        logger.error(str(ex))


""" Search a keyword or conjuction of several keywords in an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index
        query -- query to be searches 
        (For more details, refer to https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)
"""


def search_index(es_client, index_name, query):
    try:
        res = es_client.search(index=index_name, query=query)
        logger.info("Got %d Hits:" % res["hits"]["total"]["value"])
        return res
    except BadRequestError as ex:
        logger.error(str(ex))


""" Deleting an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to delete
"""


def delete_index(es_client, index_name):
    try:
        es_client.options(ignore_status=[400, 404]).indices.delete(index=index_name)
    except BadRequestError as ex:
        logger.error(str(ex))


""" Deleting a document from an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to delete
        id -- unique identifier of the document
"""


def delete_document_by_id(es_client, index_name, id):
    try:
        query = {"match": {"_id": id}}
        es_client.delete_by_query(index=index_name, query=query)
    except BadRequestError as ex:
        logger.error(str(ex))
