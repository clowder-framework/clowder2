import time
from datetime import datetime

from app.elastic_search.connect import (
    connect_elasticsearch,
    create_index,
    insert_record,
    search_index,
    delete_index,
)

dummy_index_name = "dummy_file"
dummy_record = {
    "name": "test",
    "creator": "xyz",
    "created": datetime.now(),
    "download": 0,
}
dummy_query = {"match": {"name": "test"}}


def test_feeds():
    # Create a listener (extractor)
    # Create a new search feed for file foo
    # Upload file foo
    # Verify the message
    pass
