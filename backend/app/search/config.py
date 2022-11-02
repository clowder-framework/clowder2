class IndexSettings:
    file_mappings = {
        "properties": {
            "name": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type": "keyword"},
            "download": {"type": "long"},
            "dataset_id": {"type": "text"},
            "folder_id": {"type": "text"},
            "bytes": {"type": "long"},
            "content_type": {"type": "keyword"},
        }
    }

    dataset_mappings = {
        "properties": {
            "name": {"type": "text"},
            "description": {"type": "text"},
            "author": {"type": "keyword"},
            "created": {"type": "date"},
            "modified": {"type": "date"},
            "download": {"type": "long"},
        }
    }

    metadata_mappings = {
        "properties": {
            "resource_id": {"type": "text"},
            "resource_type": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type": "keyword"},
            "contents": {"type": "object",
                        "dynamic":  True},
            "context_url": {"type": "text"},
            "content": {"type": "text"}
        }
    }
indexSettings = IndexSettings()
