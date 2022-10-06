import time
from datetime import datetime

from app.config import settings
from app.search.config import indexSettings
from app.search.connect import (
    connect_elasticsearch,
    create_index,
    insert_record,
    search_index,
    delete_index,
    delete_document_by_id,
)

dummy_file_index_name = "dummy_file"
dummy_dataset_index_name = "dummy_dataset"

dummy_file_record = {
    "name": "test file",
    "creator": "xyz",
    "created": datetime.now(),
    "download": 0,
}
dummy_dataset_record = {
    "name": "test dataset",
    "description": "dataset description",
    "author": "abcd",
    "created": datetime.now(),
    "modified": 0,
    "download": 0,
}

dummy_file_query = {"match": {"name": "test file"}}
dummy_dataset_query = {"match": {"name": "test dataset"}}


def test_files():
    es = connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            dummy_file_index_name,
            settings.elasticsearch_setting,
            indexSettings.file_mappings,
        )
        insert_record(es, dummy_file_index_name, dummy_file_record, 1)
        time.sleep(5)
        result = search_index(es, dummy_file_index_name, dummy_file_query)
        assert result["hits"]["hits"][0]["_source"]["name"] == "test file"
        delete_document_by_id(es, dummy_file_index_name, 1)
        delete_index(es, dummy_file_index_name)


def test_datasets():
    es = connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            dummy_dataset_index_name,
            settings.elasticsearch_setting,
            indexSettings.dataset_mappings,
        )
        insert_record(es, dummy_dataset_index_name, dummy_file_record, 1)
        time.sleep(5)
        result = search_index(es, dummy_dataset_index_name, dummy_file_query)
        assert result["hits"]["hits"][0]["_source"]["creator"] == "xyz"
        delete_document_by_id(es, dummy_dataset_index_name, 1)
        delete_index(es, dummy_dataset_index_name)
