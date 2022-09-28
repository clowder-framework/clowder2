import time
from datetime import datetime

from app.config import settings
from app.elastic_search.connect import (
    connect_elasticsearch,
    create_index,
    insert_record,
    search_index,
    delete_index,
    delete_document_by_id,
)

dummy_index_name = "dummy_file"
dummy_record = {
    "name": "test",
    "creator": "xyz",
    "created": datetime.now(),
    "download": 0,
}
dummy_query = {"match": {"name": "test"}}


def test_elastic_search():
    es = connect_elasticsearch()
    if es is not None:
        create_index(
            es, dummy_index_name, settings.elasticsearch_setting, settings.file_mappings
        )
        insert_record(es, dummy_index_name, dummy_record, 1)
        time.sleep(5)
        result = search_index(es, dummy_index_name, dummy_query)
        assert result["hits"]["hits"][0]["_source"]["creator"] == "xyz"
        delete_document_by_id(es, dummy_index_name, 1)
        delete_index(es, dummy_index_name)
