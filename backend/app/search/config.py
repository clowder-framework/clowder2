class IndexSettings:
    file_mappings = {
        "properties": {
            "name": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type": "keyword"},
            "downloads": {"type": "long"},
            "dataset_id": {"type": "text"},
            "folder_id": {"type": "text"},
            "bytes": {"type": "long"},
            "content_type": {"type": "keyword"},
            "content_type_main": {"type": "keyword"},
            "user_ids": {"type": "keyword"},
        }
    }

    dataset_mappings = {
        "properties": {
            "name": {"type": "text"},
            "description": {"type": "text"},
            "creator": {"type": "keyword"},
            "created": {"type": "date"},
            "modified": {"type": "date"},
            "downloads": {"type": "long"},
            "user_ids": {"type": "keyword"},
        }
    }

    metadata_mappings = {
        "properties": {
            "resource_id": {"type": "text"},
            "resource_type": {"type": "text"},
            "resource_created": {"type": "date"},
            "resource_creator": {"type": "keyword"},
            "created": {"type": "date"},
            "creator": {"type": "keyword"},
            "contents": {"type": "object"},
            "context_url": {"type": "text"},
            "definition": {"type": "text"},
            "context": {"type": "object"},
            "user_ids": {"type": "keyword"},
            # Fields used for UI rendering of results
            "name": {"type": "text"},
            "description": {"type": "text"},
            "content_type": {"type": "keyword"},
            "content_type_main": {"type": "keyword"},
            "dataset_id": {"type": "text"},
            "folder_id": {"type": "text"},
            "bytes": {"type": "long"},
            "downloads": {"type": "long"},
        }
    }


indexSettings = IndexSettings()
