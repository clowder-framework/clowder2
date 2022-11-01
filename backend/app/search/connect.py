import logging

from elasticsearch import Elasticsearch
from elasticsearch import BadRequestError

from app.config import settings
from app.models.errors import ServiceUnreachable
from app.database.errors import log_error

logger = logging.getLogger(__name__)
no_of_shards = settings.elasticsearch_no_of_shards
no_of_replicas = settings.elasticsearch_no_of_replicas


async def connect_elasticsearch():
    """To connect to elasticsearch server and return the elasticsearch client"""
    _es = None
    logger.info(settings.elasticsearch_url)
    _es = Elasticsearch(settings.elasticsearch_url)
    try:
        if _es.ping():
            logger.info("Successfully connected to Elasticsearch")
        else:
            raise ServiceUnreachable("Elasticsearch")
    except ServiceUnreachable as e:
        await log_error(e)
    return _es


def create_index(es_client, index_name, settings, mappings):
    """Generate an index in elasticsearch
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to create (Index in elasticsearch is synonymous to table in SQL)
        settings -- schema of the index with additional details
        (For more details, refer to https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)
    """
    created = False

    try:
        if not es_client.indices.exists(index=index_name):
            es_client.indices.create(
                index=index_name, settings=settings, mappings=mappings
            )
            logger.info("Created Index")
            created = True
    except BadRequestError as ex:
        logger.error(str(ex))
    finally:
        return created


def insert_record(es_client, index_name, doc, id):
    """Add a document to the index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index
        doc -- document you want to put in the index (It's similar to a record in SQL)
        id -- unique key by which you can identify the document when needed
    """
    try:
        es_client.index(index=index_name, document=doc, id=id)
    except BadRequestError as ex:
        logger.error(str(ex))


def update_record(es_client, index_name, body, id):
    """Update a document in the index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index
        doc -- document you want to update in the index
        id -- unique key by which you can identify the document when needed
    """
    try:
        es_client.update(index=index_name, id=id, body=body)
    except BadRequestError as ex:
        logger.error(str(ex))


def search_index(es_client, index_name, query):
    """Search a keyword or conjuction of several keywords in an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index
        query -- query to be searched
        (For more details, refer to https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)
    """
    try:
        res = es_client.msearch(index=index_name, searches=query)
        # TODO when there is error this structure response-hits-total-value does not exist
        # logger.info("Got %d Hits:" % res.body["responses"][0]["hits"]["total"]["value"])
        return res
    except BadRequestError as ex:
        logger.error(str(ex))


def delete_index(es_client, index_name):
    """Deleting an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to delete
    """
    try:
        es_client.options(ignore_status=[400, 404]).indices.delete(index=index_name)
    except BadRequestError as ex:
        logger.error(str(ex))


def delete_document_by_id(es_client, index_name, id):
    """Deleting a document from an index
    Arguments:
        es_client -- elasticsearch client which you get as return object from connect_elasticsearch()
        index_name -- name of index you want to delete
        id -- unique identifier of the document
    """
    try:
        query = {"match": {"_id": id}}
        es_client.delete_by_query(index=index_name, query=query)
    except BadRequestError as ex:
        logger.error(str(ex))
