class IndexSettings:
    file_mappings = {
        "properties": {
            "name": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type": "text"},
            "download": {"type": "long"},
        }
    }

    dataset_mappings = {
        "properties": {
            "name": {"type": "text"},
            "description": {"type": "text"},
            "author": {"type": "text"},
            "created": {"type": "date"},
            "modified": {"type": "date"},
            "download": {"type": "long"},
        }
    }


indexSettings = IndexSettings()
