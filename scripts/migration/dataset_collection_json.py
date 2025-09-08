import os
from datetime import datetime
import json
import requests
from dotenv import dotenv_values

try:
    import tomllib  # Python 3.11+
except ImportError:
    import tomli as tomllib

path_to_env = os.path.join(os.getcwd(),"scripts","migration", ".env")
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]
CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
base_headers_v2 = {"X-API-key": ADMIN_KEY_V2}

clowder_headers_v1 = {
    **base_headers_v1,
    "Content-type": "application/json",
    "accept": "application/json",
}

DEFAULT_PASSWORD = "Password123&"

# Get the current timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
COLLECTIONS_FILE = "collections_datasets.json"

def get_all_datasets(header):
    endpoint = f"{CLOWDER_V1}/api/datasets?superAdmin=true&limit=0"
    datasets = requests.get(endpoint, headers=header).json()
    return datasets

def get_dataset_metadata(dataset_v1_id, headers_v1):
    # Get metadata from Clowder V1
    endpoint = (
        f"{CLOWDER_V1}/api/datasets/{dataset_v1_id}/metadata.jsonld?superAdmin=true"
    )
    metadata_v1 = requests.get(endpoint, headers=headers_v1).json()
    if len(metadata_v1) > 0:
        print('we got some metadata')
        with open('datasets_with_metadata.txt', 'a') as f:
            f.write(dataset_v1_id + '\n')
    return metadata_v1

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

def get_datasets_in_collections():
    map = get_dataset_collections_map()
    datasets_in_collections = list(map.keys())
    datasets_with_metadata = []
    for i in range(0, len(datasets_in_collections)):
        current_dataset = datasets_in_collections[i]
        dataset_metadata = get_dataset_metadata(current_dataset, base_headers_v1, datasets_with_metadata)
    return datasets_in_collections

if __name__ == "__main__":
    all_datasets = get_all_datasets(base_headers_v1)
    for i in range(0, len(all_datasets)):
        current_dataset = all_datasets[i]
        get_dataset_metadata(current_dataset['id'], base_headers_v1)
    get_datasets_in_collections()

