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
COLLECTIONS_FILE = "collections_ids.txt"


# Load environment variables
path_to_env = os.path.join(os.getcwd(), "scripts", "migration", ".env")
config = dotenv_values(dotenv_path=path_to_env)


CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]
CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

if not CLOWDER_V1 or not ADMIN_KEY_V1 or not CLOWDER_V2 or not ADMIN_KEY_V2:
    print("MISSING SOME ENVIRONMENT VARIABLES")
else:
    print("WE HAVE THEM ALL")

base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
base_headers_v2 = {"X-API-key": ADMIN_KEY_V2}

clowder_headers_v1 = {
    **base_headers_v1,
    "Content-type": "application/json",
    "accept": "application/json",
}

clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}

admin_user = {
    "email": "admin@example.com",
    "password": "admin",
    "first_name": "admin",
    "last_name": "admin",
}


def get_collections_datasets(headers, collection_id):
    collection_dataset_endpoint = (
        f"{CLOWDER_V1}/api/collections/{collection_id}/datasets?superAdmin=true"
    )
    collection_dataset_response = requests.get(
        collection_dataset_endpoint, headers=headers
    )
    collection_dataset_json = collection_dataset_response.json()
    return collection_dataset_json


if __name__ == "__main__":
    print("Getting collections and datasets from Clowder v1...")

    collection_ids = []
    if os.path.exists(COLLECTIONS_FILE):
        print("exists")
    else:
        print("does not exist")

    with open(COLLECTIONS_FILE, "r") as outfile:
        lines = outfile.readlines()
        for line in lines:
            collection_ids.append(line.rstrip("\n"))
    print(f"Found {len(collection_ids)} collections in {COLLECTIONS_FILE}")
    collection_dataset_dict = dict()
    for id in collection_ids:
        print(f"Getting datasets for collection id {id}...")
        datasets = get_collections_datasets(clowder_headers_v1, id)
        if len(datasets) > 0:
            dataset_ids = []
            for ds in datasets:
                dataset_ids.append(ds["id"])
            collection_dataset_dict[id] = dataset_ids

    json_file = "collections_datasets.json"
    with open(json_file, "w") as jf:
        json.dump(collection_dataset_dict, jf)
    print("dumped to a file")
