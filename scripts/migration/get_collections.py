import os
from datetime import datetime

import requests
from dotenv import dotenv_values

try:
    import tomllib  # Python 3.11+
except ImportError:
    import tomli as tomllib


from scripts.migration.migrate_metadata_definitions import (
    check_metadata_definition_exists,
    get_clowder_v1_metadata_definitions,
    post_metadata_definition,
)

# Configuration and Constants
DEFAULT_PASSWORD = "Password123&"

# Get the current timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_FILE = "collections_ids.txt"

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


def get_clowder_v1_top_level_collections(headers):
    endpoint = f"{CLOWDER_V1}/api/collections/topLevelCollections?superAdmin=true"
    response = requests.get(endpoint, headers=headers)
    user_collections = response.json()
    return user_collections


def get_collection_v1_descendants(headers, collection_id):
    descendant_ids = []

    collection_endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}"
    response = requests.get(collection_endpoint, headers=headers, verify=False)
    collection_json = response.json()
    print(collection_json["child_collection_ids"])
    if int(collection_json["childCollectionsCount"]) > 0:
        child_collections_ids = collection_json["child_collection_ids"]
        descendant_ids = child_collections_ids[5:-1].split(", ")
        for i in range(0, len(descendant_ids)):
            id = descendant_ids[i]
            descendent_endpoint = f"{CLOWDER_V1}/api/collections/{id}"
            descendent_response = requests.get(
                descendent_endpoint, headers=headers, verify=False
            )
            descendent_json = descendent_response.json()
            if int(descendent_json["childCollectionsCount"]) > 0:
                sub_descendants = get_collection_v1_descendants(headers, id)
                descendant_ids.extend(sub_descendants)
    return descendant_ids


def get_dataset_ids_in_v1_collection(headers, collection_id):
    dataset_ids = []
    collection_endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}/datasets"
    response = requests.get(collection_endpoint, headers=headers, verify=False)
    datasets_json = response.json()
    for dataset in datasets_json:
        dataset_ids.append(dataset["id"])
    return dataset_ids


if __name__ == "__main__":
    top_level_collections = get_clowder_v1_top_level_collections(clowder_headers_v1)
    all_v1_collections = []
    for collection in top_level_collections:
        print(
            f"Getting descendents for collection {collection['name']} ({collection['id']})"
        )
        all_v1_collections.append(collection["id"])
        if int(collection["childCollectionsCount"]) > 0:
            descendant_ids = get_collection_v1_descendants(
                clowder_headers_v1, collection["id"]
            )
            all_v1_collections.extend(descendant_ids)
            print(
                f"Added descendents for collection {collection['name']} ({collection['id']})"
            )

    print(f"TOTAL V1 COLLECTIONS TO MIGRATE: {len(all_v1_collections)}")

    with open(OUTPUT_FILE, "w") as outfile:
        for v1_collection in all_v1_collections:
            outfile.write(v1_collection + "\n")
    print(f"Migration complete. New users logged to {OUTPUT_FILE}")
