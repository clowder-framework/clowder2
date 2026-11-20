class IndexSettings:
    es_mappings = {
        "properties": {
            # common fields
            "resource_type": {"type": "text"},
            "creator": {"type": "keyword"},
            "created": {"type": "date"},
            "modified": {"type": "date"},
            "user_ids": {"type": "keyword"},
            "name": {"type": "text"},
            "description": {"type": "text"},
            "downloads": {"type": "long"},
            # file-specific fields
            "content_type": {"type": "keyword"},
            "content_type_main": {"type": "keyword"},
            "dataset_id": {"type": "text", "index": False},
            "folder_id": {"type": "text", "index": False},
            "bytes": {"type": "long"},
            # metadata fields
            # Use "flattened" rather than "object": arbitrary user/extractor
            # metadata has unpredictable value types for the same key across
            # documents (e.g. one doc has a numeric "Number pixels", another has
            # the string "2.53266M"). A dynamic "object" mapping infers a type
            # from the first value it sees per key and then rejects conflicting
            # documents with mapper_parsing_exception. "flattened" indexes every
            # leaf as a keyword under a single field, so no type conflicts occur.
            "metadata": {
                "type": "flattened",
            },
        }
    }


indexSettings = IndexSettings()
