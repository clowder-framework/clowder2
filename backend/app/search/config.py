class IndexSettings:
    file_mappings = {
        "properties": {
            "name": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type": "keyword"},
            "download": {"type": "long"},
            "dataset_id": {"type": "string"},
            "folder_id": {"type": "string"},
            "bytes": {"type": "long"},
            "content_type:": {"type": "keyword"},
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


indexSettings = IndexSettings()
