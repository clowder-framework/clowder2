class IndexSettings:
    file_mappings = {
        "properties": {
            "name": {"type": "text"},
            "created": {"type": "date"},
            "creator": {"type""keyword"},
            "download": {"type": "long"},
        }
    }

    dataset_mappings = {
        "properties": {
            "name": {"type": "text"},
            "description": {"type": "text"},
            "author": {"type""keyword"},
            "created": {"type": "date"},
            "modified": {"type": "date"},
            "download": {"type": "long"},
        }
    }


indexSettings = IndexSettings()
