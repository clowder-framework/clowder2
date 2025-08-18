import os
from datetime import datetime
import json
import requests
from dotenv import dotenv_values

try:
    import tomllib  # Python 3.11+
except ImportError:
    import tomli as tomllib



DEFAULT_PASSWORD = "Password123&"

# Get the current timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
COLLECTIONS_FILE = "collections_datasets.json"

def get_dataset_collections_map():
    print("Getting collections and datasets from Clowder v1...")

    with open(COLLECTIONS_FILE, "r") as jf:
        data = json.load(jf)
    print(f"Loaded {len(data)} collections from {COLLECTIONS_FILE}")
    dataset_to_collection = {}

    for collection, datasets in data.items():
        for dataset in datasets:
            if dataset not in dataset_to_collection:
                dataset_to_collection[dataset] = [collection]
            else:
                current_value = dataset_to_collection[dataset]
                current_value.append(collection)
                dataset_to_collection[dataset] = current_value
    return dataset_to_collection

