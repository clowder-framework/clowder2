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
            "metadata": {
                "type": "object",
                "dynamic": True,
            },
            # metadata fields cast to plain string to enable search
            "metadata_stringify": {"type": "text"},
        }
    }


indexSettings = IndexSettings()
