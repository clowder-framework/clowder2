import json
import time
from datetime import datetime

import pytest
from app.config import settings
from app.search.config import indexSettings
from app.search.connect import (
    connect_elasticsearch,
    create_index,
    delete_document_by_id,
    delete_document_by_query,
    delete_index,
    insert_record,
    search_index,
    update_record,
)
from bson import ObjectId

dummy_file_record = {
    "name": "test file",
    "creator": "xyz",
    "created": datetime.now(),
    "download": 0,
    "dataset_id": str(ObjectId("63458339aaecb776733354ea")),
    "folder_id": None,
    "bytes": 123456,
    "content_type": "application/json",
}
updated_dummy_file_record = {
    "doc": {
        "name": "test file 2",
        "creator": "xyz",
        "created": datetime.now(),
        "download": 0,
    }
}
dummy_dataset_record = {
    "name": "test dataset",
    "description": "dataset description",
    "creator": "abcd",
    "created": datetime.now(),
    "modified": 0,
    "download": 0,
}
updated_dummy_dataset_record = {
    "doc": {
        "name": "test dataset 2",
        "description": "dataset description",
        "creator": "abcd",
        "created": datetime.now(),
        "modified": 1,
        "download": 0,
    }
}

dummy_public_file_record = {
    "name": "public test file",
    "creator": "xyz",
    "created": datetime.now(),
    "download": 0,
    "dataset_id": str(ObjectId("63458339aaecb776733354ea")),
    "folder_id": None,
    "bytes": 123456,
    "content_type": "application/json",
    "public": "true",
    "status": "PUBLIC",
}
updated_dummy_public_file_record = {
    "doc": {
        "name": "public test file 2",
        "creator": "xyz",
        "created": datetime.now(),
        "download": 0,
        "public": "true",
        "status": "PUBLIC",
    }
}
dummy_public_dataset_record = {
    "name": "public test dataset",
    "description": "public dataset description",
    "creator": "abcd",
    "created": datetime.now(),
    "modified": 0,
    "download": 0,
    "status": "PUBLIC",
}
updated_dummy_public_dataset_record = {
    "doc": {
        "name": "public test dataset 2",
        "description": "public dataset description",
        "creator": "abcd",
        "created": datetime.now(),
        "modified": 1,
        "download": 0,
        "status": "PUBLIC",
    }
}


@pytest.mark.asyncio
async def test_files():
    # TODO: Replace this with actual file upload and search, not directly inserting record to ES
    es = await connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            settings.elasticsearch_index,
            settings.elasticsearch_setting,
            indexSettings.es_mappings,
        )
        insert_record(es, settings.elasticsearch_index, dummy_file_record, 1)
        time.sleep(1)
        dummy_file_query = []
        # header
        dummy_file_query.append({"index": settings.elasticsearch_index})
        # body
        dummy_file_query.append({"query": {"match": {"creator": "xyz"}}})
        file_query = ""
        for each in dummy_file_query:
            file_query += "%s \n" % json.dumps(each)

        result = search_index(es, settings.elasticsearch_index, file_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "test file"
        )

        # check for update to the record
        update_record(es, settings.elasticsearch_index, updated_dummy_file_record, 1)
        time.sleep(1)
        result = search_index(es, settings.elasticsearch_index, file_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "test file 2"
        )
        query = {"match": {"name": "test file 2"}}
        delete_document_by_query(es, settings.elasticsearch_index, query)
        delete_index(es, settings.elasticsearch_index)


@pytest.mark.asyncio
async def test_datasets():
    # TODO: Replace this with actual file upload and search, not directly inserting record to ES
    es = await connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            settings.elasticsearch_index,
            settings.elasticsearch_setting,
            indexSettings.es_mappings,
        )
        insert_record(es, settings.elasticsearch_index, dummy_dataset_record, 1)
        time.sleep(1)
        dummy_dataset_query = []
        # header
        dummy_dataset_query.append({"index": settings.elasticsearch_index})
        # body
        dummy_dataset_query.append({"query": {"match": {"creator": "abcd"}}})
        dataset_query = ""
        for each in dummy_dataset_query:
            dataset_query += "%s \n" % json.dumps(each)
        result = search_index(es, settings.elasticsearch_index, dataset_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["creator"]
            == "abcd"
        )

        # check for update to the record
        update_record(es, settings.elasticsearch_index, updated_dummy_dataset_record, 1)
        time.sleep(1)
        result = search_index(es, settings.elasticsearch_index, dataset_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "test dataset 2"
        )
        delete_document_by_id(es, settings.elasticsearch_index, 1)
        delete_index(es, settings.elasticsearch_index)


@pytest.mark.asyncio
async def test_public_files():
    # TODO: Replace this with actual file upload and search, not directly inserting record to ES
    es = await connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            settings.elasticsearch_index,
            settings.elasticsearch_setting,
            indexSettings.es_mappings,
        )
        insert_record(es, settings.elasticsearch_index, dummy_public_file_record, 1)
        time.sleep(1)
        dummy_file_query = []

        user_public_clause = {
            "bool": {
                "should": [
                    {"term": {"status": "public"}},
                ]
            }
        }
        # header
        dummy_file_query.append({"index": settings.elasticsearch_index})
        # body
        # dummy_file_query.append({"query": {"match": {"creator": "xyz"}}})
        dummy_file_query.append({"query": user_public_clause})
        file_query = ""
        for each in dummy_file_query:
            file_query += "%s \n" % json.dumps(each)

        result = search_index(es, settings.elasticsearch_index, file_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "public test file"
        )

        # check for update to the record
        update_record(
            es, settings.elasticsearch_index, updated_dummy_public_file_record, 1
        )
        time.sleep(1)
        result = search_index(es, settings.elasticsearch_index, file_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "public test file 2"
        )
        query = {"match": {"name": "public test file 2"}}
        delete_document_by_query(es, settings.elasticsearch_index, query)
        delete_index(es, settings.elasticsearch_index)


@pytest.mark.asyncio
async def test_public_datasets():
    # TODO: Replace this with actual file upload and search, not directly inserting record to ES
    es = await connect_elasticsearch()
    if es is not None:
        create_index(
            es,
            settings.elasticsearch_index,
            settings.elasticsearch_setting,
            indexSettings.es_mappings,
        )
        insert_record(es, settings.elasticsearch_index, dummy_public_dataset_record, 1)
        time.sleep(1)
        dummy_dataset_query = []
        # header
        dummy_dataset_query.append({"index": settings.elasticsearch_index})
        # body
        query = {
            "bool": {
                "should": [
                    {"term": {"creator": "abcd"}},
                    {"term": {"status": "public"}},
                ]
            }
        }
        dummy_dataset_query.append({"query": query})
        dataset_query = ""
        for each in dummy_dataset_query:
            dataset_query += "%s \n" % json.dumps(each)
        result = search_index(es, settings.elasticsearch_index, dataset_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["creator"]
            == "abcd"
        )

        # check for update to the record
        update_record(
            es, settings.elasticsearch_index, updated_dummy_public_dataset_record, 1
        )
        time.sleep(1)
        result = search_index(es, settings.elasticsearch_index, dataset_query)
        assert (
            result.body["responses"][0]["hits"]["hits"][0]["_source"]["name"]
            == "public test dataset 2"
        )
        delete_document_by_id(es, settings.elasticsearch_index, 1)
        delete_index(es, settings.elasticsearch_index)
