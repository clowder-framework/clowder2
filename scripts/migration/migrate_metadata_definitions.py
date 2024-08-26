import os
from datetime import datetime

import requests
from dotenv import dotenv_values

path_to_env = os.path.join(os.getcwd(), ".env")
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1_URL = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]

CLOWDER_V2_URL = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
clowder_headers_v1 = {
    **base_headers_v1,
    "Content-type": "application/json",
    "accept": "application/json",
}

base_headers_v2 = {"x-api-key": ADMIN_KEY_V2}
clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}


def get_clowder_v1_metadata_definitions(
    clowder_v1_url=CLOWDER_V1_URL, headers=clowder_headers_v1
):
    r = requests.get(
        f"{clowder_v1_url}/api/metadata/definitions", headers=headers, verify=False
    )
    return r.json()


def map_widget_type(field_type):
    if field_type == "string":
        return "TextField"
    elif field_type == "datetime":
        return "DateTimePicker"
    elif field_type in ["list", "listjquery", "annotation", "scientific_variable"]:
        return "Select"
    else:
        return "TextField"  # default widget type if not specified


def fetch_definitions(definitions_url, headers=base_headers_v1):
    response = requests.get(definitions_url, headers=headers, verify=False)

    if response.status_code == 200:
        data = response.json()

        # If the data is a simple list, return it
        if isinstance(data, list):
            return data

        # If the data is a dictionary, check if its values are lists
        elif isinstance(data, dict):
            flattened = []
            for key, value in data.items():
                if isinstance(value, list):
                    flattened.extend(value)
                else:
                    print(
                        f"Value for key '{key}' is not a list. Skipping flattening for this key."
                    )
                    return []
            return flattened

        else:
            print("Unexpected structure in response data. Returning empty list.")
            return []

    else:
        print(
            f"Failed to fetch definitions from {definitions_url}. Status code: {response.status_code}"
        )
        return []


def transform_metadata_v1_to_v2(v1_metadata):
    # Extracting data from v1 format
    label = v1_metadata.get("json", {}).get("label", "")
    uri = v1_metadata.get("json", {}).get("uri", "")
    type_ = v1_metadata.get("json", {}).get("type", "string")
    definitions_url = v1_metadata.get("json", {}).get("definitions_url", "")

    widget_type = map_widget_type(type_)
    field_config = {"type": type_}
    is_list = False

    if widget_type == "Select":
        options = fetch_definitions(definitions_url)
        field_config = {"type": "enum", "options": options}

    # Constructing v2 format
    v2_metadata = {
        "name": label,
        "description": v1_metadata.get("json", {}).get(
            "description", f"Metadata for {label}"
        ),
        "required_for_items": {"datasets": False, "files": False},
        "context": [{label.lower(): uri}],
        "fields": [
            {
                "name": label.lower(),
                "list": is_list,
                "widgetType": widget_type,
                "config": field_config,
                "required": False,
            }
        ],
    }

    return v2_metadata


def post_metadata_definition(
    v1_metadata, clowder_v2_url=CLOWDER_V2_URL, headers=clowder_headers_v2
):
    # Transform v1 to v2
    v2_metadata = transform_metadata_v1_to_v2(v1_metadata)

    # Post to Clowder v2
    response = requests.post(
        f"{clowder_v2_url}/api/v2/metadata/definition",
        json=v2_metadata,
        headers=headers,
    )

    if response.status_code == 200:
        return response.json().get("id")
    else:
        print(
            f"Failed to post metadata definition. Status code: {response.status_code}"
        )
        return None


def cleanup_metadata_definition(
    definition_id, clowder_v2_url=CLOWDER_V2_URL, headers=clowder_headers_v2
):
    delete_url = f"{clowder_v2_url}/metadata/definition/{definition_id}"
    response = requests.delete(delete_url, headers=headers)

    if response.status_code == 204:
        print(f"Successfully deleted metadata definition with ID: {definition_id}")
    else:
        print(
            f"Failed to delete metadata definition with ID: {definition_id}. Status code: {response.status_code}"
        )


if __name__ == "__main__":
    v1_md_definitions = get_clowder_v1_metadata_definitions(
        CLOWDER_V1_URL, base_headers_v1
    )
    posted_ids = []

    for v1_md in v1_md_definitions:
        definition_id = post_metadata_definition(
            v1_md, CLOWDER_V2_URL, clowder_headers_v2
        )
        if definition_id:
            posted_ids.append(definition_id)

    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"migrated_metadata_definition_{timestamp}.log"
    with open(filename, "w") as file:
        for id in posted_ids:
            file.write(f"{id}\n")

    # Uncomment the lines below if you need to clean up (delete) the posted metadata definitions
    # for id in posted_ids:
    #     cleanup_metadata_definition(id, CLOWDER_V2, clowder_headers_v2)
