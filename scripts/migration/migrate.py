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

from scripts.migration.dataset_collection_json import get_dataset_collections_map

DATASET_COLLECTIONS_MAP = get_dataset_collections_map()

# Configuration and Constants
DEFAULT_PASSWORD = "Password123&"

# Get the current timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_FILE = f"migrated_new_users_{timestamp}.log"

# Load environment variables
path_to_env = os.path.join(os.getcwd(),"scripts","migration", ".env")
path_to_toml = os.path.join(os.getcwd(),"scripts","migration", "config.toml")
config = dotenv_values(dotenv_path=path_to_env)

toml_space_ids=None
toml_exclude_space_ids=None
toml_users=None
toml_exclude_users=None
toml_exclude_dataset_ids=None

# Load configuration from toml file
if os.path.exists(path_to_toml):
    toml_config = tomllib.loads(open(path_to_toml).read())
    print(f"Loaded toml config")
    toml_space_ids = toml_config["spaces"]["space_ids"]
    toml_exclude_space_ids = toml_config["spaces"]["exclude_space_ids"]
    toml_users = toml_config["users"]["user_emails"]
    toml_exclude_dataset_ids = toml_config["datasets"]["exclude_dataset_ids"]


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


def email_user_new_login(user_email):
    """Send an email to the user with the new login details."""
    print(f"Login to the new Clowder instance: {user_email}")


def generate_user_api_key(user, password=DEFAULT_PASSWORD):
    """Generate an API key for a user."""
    login_endpoint = f"{CLOWDER_V2}/api/v2/login"
    user.update({"password": password})
    response = requests.post(login_endpoint, json=user)
    token = response.json().get("token")
    current_headers = {"Authorization": f"Bearer {token}"}

    api_key_endpoint = f"{CLOWDER_V2}/api/v2/users/keys?name=migration&mins=0"
    result = requests.post(api_key_endpoint, headers=current_headers)
    return result.json()


def get_clowder_v1_users():
    """Retrieve all users from Clowder v1."""
    endpoint = f"{CLOWDER_V1}/api/users?superAdmin=true"
    response = requests.get(endpoint, headers=base_headers_v1, verify=False)
    return response.json()


def get_clowder_v1_user_datasets(user_id):
    """Retrieve datasets created by a specific user in Clowder v1."""
    # TODO what about pagination
    endpoint = f"{CLOWDER_V1}/api/datasets?limit=0&superAdmin=true"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return [dataset for dataset in response.json() if dataset["authorId"] == user_id]


def get_clowder_v1_user_spaces(user_v1):
    endpoint = f"{CLOWDER_V1}/api/spaces?superAdmin=true"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return [space for space in response.json() if space["creator"] == user_v1["id"]]


def get_clowder_v1_user_spaces_members(space_id):
    endpoint = f"{CLOWDER_V1}/api/spaces/{space_id}/users?superAdmin=true"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return response.json()


def get_clowder_v2_space_datasets(space_id):
    endpoint = f"{CLOWDER_V1}/api/spaces/{space_id}/datasets?superAdmin=true"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return response.json()


def share_dataset_with_group(group_id, dataset, headers):
    endpoint = f"{CLOWDER_V2}/authorizations/datasets/{dataset['id']}/group_role/{group_id}/viewer"
    response = requests.get(endpoint, headers=headers, verify=False)
    return response.json()


def add_v1_space_members_to_v2_group(space, group_id, headers):
    space_members = get_clowder_v1_user_spaces_members(space["id"])
    for member in space_members:
        member_email = member["email"]
        endpoint = f"{CLOWDER_V2}/api/v2/groups/{group_id}/add/{member_email}"
        requests.post(
            endpoint,
            headers=headers,
        )


def get_collection_v1_descendants(headers, collection_id):
    descendant_ids = []

    collection_endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}"
    response = requests.get(collection_endpoint, headers=headers, verify=False)
    collection_json = response.json()
    print(collection_json["child_collection_ids"])
    if int(collection_json["childCollectionsCount"]) > 0:
        child_collections_ids = collection_json["child_collection_ids"]
        descendant_ids = child_collections_ids[5:-1].split(', ')
        for id in descendant_ids:
            descendent_endpoint = f"{CLOWDER_V1}/api/collections/{id}"
            descendent_response = requests.get(descendent_endpoint, headers=headers, verify=False)
            descendent_json = descendent_response.json()
            if int(descendent_json["childCollectionsCount"]) > 0:
                sub_descendants = get_collection_v1_descendants(headers, id)
                descendant_ids.extend(sub_descendants)
    return descendant_ids

def get_clowder_v1_user_collections(headers, user_v1):
    endpoint = f"{CLOWDER_V1}/api/collections"
    response = requests.get(endpoint, headers=headers)
    return [col for col in response.json() if col["authorId"] == user_v1["id"]]


def get_clowder_v1_user_collections_top_level(headers, user_v1):
    top_level_collections = []

    endpoint = f"{CLOWDER_V1}/api/collections/topLevelCollections"
    response = requests.get(endpoint, headers=headers)
    response_json = response.json()
    for col in response_json:
        author = col["author"]
        author_id = author.lstrip('MiniUser(')
        author_id = author_id[:author_id.index(',')]
        if author_id == user_v1["id"]:
           top_level_collections.append(col)
    return top_level_collections

def process_collection_descendants(collection, headers_v1,headers_v2, v2_parent_id, v2_parent_type, v2_dataset_id):
    child_collections_endpoint = f"{CLOWDER_V1}/api/collections/{collection['id']}/getChildCollections"
    datasets_endpoint = f"{CLOWDER_V1}/api/collections/{collection['id']}/datasets"

    child_col_response = requests.get(child_collections_endpoint, headers=headers_v1)
    dataset_response = requests.get(datasets_endpoint, headers=headers_v1)
    child_col_json = child_col_response.json()
    dataset_json = dataset_response.json()

    print(f"Got child collections and datasets")
    for child in child_col_json:
        if v2_parent_type == "dataset":
            print(f"Add folder to the dataset")
            folder_name = child["name"]
            new_folder = create_folder_if_not_exists_or_get(folder_name, None, v2_dataset_id, headers_v2)
            process_collection_descendants(child, headers_v1,headers_v2, new_folder['id'], 'folder', v2_dataset_id )
        else:
            print(f"parent was a folder")
            print(f"Add folder to the dataset")
            folder_name = child["name"]
            new_folder = create_folder_if_not_exists_or_get(folder_name, v2_parent_id, v2_dataset_id, headers_v2)
            process_collection_descendants(child, headers_v1, headers_v2, new_folder['id'], 'folder', v2_dataset_id)

    for dataset in dataset_json:
        if v2_parent_type == "dataset":
            print(f"Parent is a dataset")
            new_folder = create_folder_if_not_exists_or_get(dataset["name"], v2_parent_id, v2_dataset_id, headers_v2)
            print(f"Now we need to add the sub folders of this dataset")
            # TODO get DATASET FOLDERS HERE FROM v1
            process_dataset_folders(dataset, headers_v1, headers_v2, new_folder['id'], v2_dataset_id)
            process_dataset_files(dataset, headers_v1, headers_v2, 'folder', new_folder['id'], v2_dataset_id)
        else:
            print(f"Parent is a folder")
            new_folder = create_folder_if_not_exists_or_get(dataset["name"], v2_parent_id, v2_dataset_id, headers_v2)
            # TODO GET DATASET FOLDERS HERE FROM v1
            process_dataset_folders(dataset, headers_v1, headers_v2, new_folder['id'], v2_dataset_id)
            process_dataset_files(dataset, headers_v1, headers_v2, 'folder', new_folder['id'], v2_dataset_id)



def process_dataset_folders(dataset, headers_v1, headers_v2, parent_type, parent_id):
    folder_endpoint = f"{CLOWDER_V1}/api/datasets/{dataset['id']}/folders"
    folder_response = requests.get(folder_endpoint, headers=headers_v1)
    folder_json = folder_response.json()
    print(f"Got dataset folders")

def get_v1_dataset_folders(dataset, headers_v1, headers_v2, parent_type, parent_id):
    folder_endpoint = f"{CLOWDER_V1}/api/datasets/{dataset['id']}/folders"
    folder_response = requests.get(folder_endpoint, headers=headers_v1)
    folder_json = folder_response.json()
    return folder_json

def process_dataset_files(dataset, headers_v1, headers_v2, parent_type, parent_id, dataset_v2_id):
    dataset_v1_folders = get_v1_dataset_folders(dataset, headers_v1, headers_v2, parent_type, parent_id)

    for folder_v1 in dataset_v1_folders:
        current_folder_hierarchy = folder_v1['name']
        add_folder_hierarchy_to_migration_folder(folder_hierarchy=current_folder_hierarchy,
                                                 dataset_v2=dataset_v2_id,
                                                 folder_id_v2=parent_id,
                                                 headers=headers_v2
                                                 )

    all_v2_dataset_folders = get_all_folder_and_subfolders(dataset_v2_id, headers_v2)
    files_endpoint = f"{CLOWDER_V1}/api/datasets/{dataset['id']}/files"
    files_response = requests.get(files_endpoint, headers=headers_v1)
    files_json = files_response.json()
    # TODO WORK HERE
    for file in files_json:
        if 'folders' in file:
            print(f"This file is in a folder")
            current_file_folder_name = file['folders']['name']
            matching_folder = None
            for folder_v2 in all_v2_dataset_folders:
                if folder_v2['name'] == file['folders']['name']:
                    print(f"Upload this file to a folder")
                    matching_folder = folder_v2
                    download_and_upload_file()
        else:
            print(f"This file is not in a folder")
            # TODO upload it to the folder
            if parent_type == "dataset":
                print(f"Upload to a dataset")
            if parent_type == "folder":
                print(f"Upload to a folder")
    print(f"Got dataset files")



def create_v2_dataset_from_collection(collection, user_v1, headers_v1, headers_v2):
    # create the dataset
    collection_name = collection["name"]
    collection_description = collection["description"]
    v2_license_id = "CC BY"

    dataset_in_v2_endpoint = f"{CLOWDER_V2}/api/v2/datasets?license_id={v2_license_id}"
    dataset_example = {
        "name":collection_name,
        "description": collection_description
    }
    response = requests.post(
        dataset_in_v2_endpoint, headers=headers_v2, json=dataset_example
    )

    new_dataset_json = response.json()
    v2_dataset_id = new_dataset_json["id"]

    process_collection_descendants(collection, headers_v1, headers_v2, new_dataset_json["id"], "dataset", v2_dataset_id)

    return response.json()["id"]


    # go through sub collections creating folders
    print("Creating v2-dataset from collection")


# TODO this is too slow, we need to optimize it
def get_clowder_v1_dataset_collections(headers, user_v1, dataset_id):
    matching_collections = []
    endpoint = f"{CLOWDER_V1}/api/collections/topLevelCollections?superAdmin=true"
    response = requests.get(endpoint, headers=headers)
    user_collections = response.json()

    for collection in user_collections:
        collection_id = collection["id"]
        collection_dataset_endpoint = (
            f"{CLOWDER_V1}/api/collections/{collection_id}/datasets"
        )
        try:
            dataset_response = requests.get(
                collection_dataset_endpoint, headers=headers
            )
            datasets = dataset_response.json()
            for ds in datasets:
                if ds["id"] == dataset_id:
                    if collection not in matching_collections:
                        matching_collections.append(collection)
        except Exception as e:
            print("Exception", e)
        if int(collection["childCollectionsCount"]) > 0:
            collection_descendants = get_collection_v1_descendants(headers, collection_id)
            for descendant in collection_descendants:
                collection_dataset_endpoint = (
                    f"{CLOWDER_V1}/api/collections/{descendant}/datasets?superAdmin=true"
                )
                collection_dataset_response = requests.get(
                    collection_dataset_endpoint, headers=headers
                )
                collection_dataset_json = collection_dataset_response.json()
                for ds in collection_dataset_json:
                    if ds['id'] == dataset_id:
                        if descendant not in matching_collections:
                            matching_collections.append(descendant)
    return matching_collections


def get_clowder_v1_collection(collection_id, headers):
    endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}"
    response = requests.get(endpoint, headers=headers)
    return response.json()


def get_clowder_v1_collections(collection_ids, headers):
    collections = []
    for collection_id in collection_ids:
        endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}"
        response = requests.get(endpoint, headers=headers)
        collections.append(response.json())
    return collections


def get_clowder_v1_collection_self_and_ancestors(
    collection_id, self_and_ancestors, headers
):
    endpoint = f"{CLOWDER_V1}/api/collections/{collection_id}"
    response = requests.get(endpoint, headers=headers)
    self = response.json()
    if self["id"] not in self_and_ancestors:
        self_and_ancestors.append(self["id"])
    parents_entry = self["parent_collection_ids"]
    parents_entry = parents_entry.lstrip("List(")
    parents_entry = parents_entry.rstrip(")")
    if parents_entry != "":
        parents = parents_entry.split(",")
        for parent in parents:
            # replace empty space
            parent = parent.lstrip(" ")
            parent = parent.rstrip(" ")
            if parent not in self_and_ancestors:
                self_and_ancestors.append(parent)
        for parent in parents:
            parent = parent.lstrip(" ")
            parent = parent.rstrip(" ")
            if parent != "" and parent is not None:
                current_self_and_ancestors = (
                    get_clowder_v1_collection_self_and_ancestors(
                        parent, self_and_ancestors, headers=headers
                    )
                )
                for col_id in current_self_and_ancestors:
                    if col_id not in self_and_ancestors:
                        self_and_ancestors.append(col_id)
    return self_and_ancestors


def get_clowder_v1_parent_collection_ids(current_collection_id, headers):
    parents = []
    all_collections_v1_endpoint = (
        f"{CLOWDER_V1}/api/collections/allCollections?limit=0&showAll=true"
    )
    response = requests.get(all_collections_v1_endpoint, headers=headers)
    all_collections = response.json()
    for collection in all_collections:
        children_entry = collection["child_collection_ids"]
        children_entry = children_entry.lstrip("List(")
        children_entry = children_entry.rstrip(")")
        child_ids = children_entry.split(",")
        for child in child_ids:
            if child == current_collection_id:
                parents.append(collection["id"])
    return parents


def create_local_user(user_v1):
    """Create a local user in Clowder v2 if they don't already exist, and generate an API key."""
    # Search for the user by email
    search_endpoint = f"{CLOWDER_V2}/api/v2/users/search"
    search_params = {"text": user_v1["email"]}
    search_response = requests.get(
        search_endpoint, headers=clowder_headers_v2, params=search_params
    )

    # Check if user already exists
    if search_response.status_code == 200:
        search_data = search_response.json()
        if search_data.get("metadata", {}).get("total_count", 0) > 0:
            for existing_user in search_response.json().get("data", []):
                if existing_user.get("email") == user_v1["email"]:
                    print(f"User {user_v1['email']} already exists in Clowder v2.")
                    return generate_user_api_key(
                        existing_user, DEFAULT_PASSWORD
                    )  # Return the existing user's API key

    # User does not exist, proceed to create a new user
    user_json = {
        "email": user_v1["email"],
        "password": DEFAULT_PASSWORD,
        "first_name": user_v1["firstName"],
        "last_name": user_v1["lastName"],
    }

    # Create the user
    create_user_response = requests.post(f"{CLOWDER_V2}/api/v2/users", json=user_json)
    if create_user_response.status_code == 200:
        print(f"Created user {user_v1['email']} in Clowder v2.")
        email_user_new_login(user_v1["email"])

        # Generate and return API key for the new user
        api_key = generate_user_api_key(user_json, DEFAULT_PASSWORD)
        with open(OUTPUT_FILE, "a") as f:
            f.write(f"{user_v1['email']},{DEFAULT_PASSWORD},{api_key}\n")
        return api_key
    else:
        print(
            f"Failed to create user {user_v1['email']}. Status code: {create_user_response.status_code}"
        )
        return None


def create_admin_user():
    """Create an admin user and return the API key."""
    requests.post(f"{CLOWDER_V2}/api/v2/users", json=admin_user)
    return generate_user_api_key(admin_user, admin_user["password"])


def add_dataset_license(v1_license, headers):
    """Create appropriate license (standard/custom) based on v1 license details"""
    license_id = "CC BY"
    # standard licenses
    if v1_license["license_type"] == "license2":
        if (
            not v1_license["ccAllowCommercial"]
            and not v1_license["ccAllowDerivative"]
            and not v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY-NC-ND"
        elif (
            v1_license["ccAllowCommercial"]
            and not v1_license["ccAllowDerivative"]
            and not v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY-ND"
        elif (
            not v1_license["ccAllowCommercial"]
            and v1_license["ccAllowDerivative"]
            and not v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY-NC"
        elif (
            not v1_license["ccAllowCommercial"]
            and v1_license["ccAllowDerivative"]
            and v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY-NC-SA"
        elif (
            v1_license["ccAllowCommercial"]
            and v1_license["ccAllowDerivative"]
            and v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY-SA"
        elif (
            v1_license["ccAllowCommercial"]
            and v1_license["ccAllowDerivative"]
            and not v1_license["ccRequireShareAlike"]
        ):
            license_id = "CC BY"
    elif v1_license["license_type"] == "license3":
        license_id = "CCO Public Domain Dedication"
    else:
        # custom license
        license_body = {
            "name": v1_license["license_text"],
            "url": v1_license["license_url"],
            "holders": v1_license["holders"],
        }
        if license_body["url"] == "":
            license_body["url"] = "https://dbpedia.org/page/All_rights_reserved"
        license_v2_endpoint = f"{CLOWDER_V2}/api/v2/licenses?"
        response = requests.post(
            license_v2_endpoint, headers=headers, json=license_body
        )
        print(response.json())
        license_id = response.json()["id"]
    return license_id


def create_v2_dataset(dataset, headers):
    """Create a dataset in Clowder v2."""
    # TODO: GET correct license
    print("Creating dataset license in Clowder v2.")
    try:
        v2_license_id = add_dataset_license(dataset["license"], headers)
    except Exception as e:
        print(f"Error creating dataset license: {e}")
        v2_license_id = "CC BY"

    dataset_in_v2_endpoint = f"{CLOWDER_V2}/api/v2/datasets?license_id={v2_license_id}"
    dataset_example = {
        "name": dataset["name"],
        "description": dataset["description"],
    }
    response = requests.post(
        dataset_in_v2_endpoint, headers=headers, json=dataset_example
    )
    return response.json()["id"]


def create_v2_group(space, headers):
    group = {"name": space["name"], "description": space["description"]}
    group_in_v2_endpoint = f"{CLOWDER_V2}/api/v2/groups"
    response = requests.post(group_in_v2_endpoint, json=group, headers=headers)
    return response.json()["id"]

# TODO try this
def add_folder_hierarchy_to_migration_folder(folder_hierarchy, dataset_v2, folder_id_v2, headers):
    """Add folder hierarchy to a dataset in Clowder v2."""
    hierarchy_parts = folder_hierarchy.split("/")
    if hierarchy_parts[0] == '':
        hierarchy_parts = hierarchy_parts[1:]
    current_parent = folder_id_v2
    for part in hierarchy_parts:
        result = create_folder_if_not_exists_or_get(
            part, current_parent, dataset_v2, headers
        )
        if result:
            current_parent = result["id"]

def add_folder_hierarchy(folder_hierarchy, dataset_v2, headers):
    """Add folder hierarchy to a dataset in Clowder v2."""
    hierarchy_parts = folder_hierarchy.split("/")
    current_parent = None
    for part in hierarchy_parts:
        result = create_folder_if_not_exists_or_get(
            part, current_parent, dataset_v2, headers
        )
        if result:
            current_parent = result["id"]


def create_folder_if_not_exists_or_get(folder, parent, dataset_v2, headers):
    """Create a folder if it does not exist or return the existing folder."""
    # current_folders = get_folder_and_subfolders(dataset_v2, headers)
    current_all_folders = get_all_folder_and_subfolders(dataset_v2, headers)
    folder_data = (
        {"name": folder, "parent_folder": parent} if parent else {"name": folder}
    )

    for existing_folder in current_all_folders:
        if existing_folder["name"] == folder:
            return existing_folder

    response = requests.post(
        f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2}/folders",
        json=folder_data,
        headers=headers,
    )
    return response.json()

def get_all_folder_and_subfolders(dataset_id, headers):
    """Retrieve all folders and subfolders in a dataset."""
    endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_id}/all_folders"
    response = requests.get(endpoint, headers=headers)
    folder_response = response.json().get("data", [])
    return folder_response


def get_folder_and_subfolders(dataset_id, headers):
    """Retrieve all folders and subfolders in a dataset."""
    endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_id}/folders_and_files"
    response = requests.get(endpoint, headers=headers)
    return [
        folder
        for folder in response.json().get("data", [])
        if folder["object_type"] == "folder"
    ]


def add_dataset_folders(dataset_v1, dataset_v2, headers):
    """Add folders from a Clowder v1 dataset to a Clowder v2 dataset."""
    endpoint = f"{CLOWDER_V1}/api/datasets/{dataset_v1['id']}/folders?superAdmin=true"
    folders = requests.get(endpoint, headers=clowder_headers_v1).json()

    for folder in folders:
        add_folder_hierarchy(folder["name"], dataset_v2, headers)


def download_and_upload_file_to_folder(file, folder, dataset_v2_id, headers_v2):
    """Download a file from Clowder v1 and upload it to Clowder v2."""
    filename = file["filename"]
    file_id = file["id"]
    file_folder = folder

    # Download the file from Clowder v1
    v1_download_url = f"{CLOWDER_V1}/api/files/{file_id}?superAdmin=true"
    print(f"Downloading file: {filename}")
    download_response = requests.get(v1_download_url, headers=clowder_headers_v1)

    with open(filename, "wb") as f:
        f.write(download_response.content)

    # Upload the file to Clowder v2
    dataset_file_upload_endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/files"
    if folder:
        dataset_file_upload_endpoint += f"Multiple?folder_id={folder['id']}"
        response = requests.post(
            dataset_file_upload_endpoint,
            headers=headers_v2,
            files={"file": open(filename, "rb")},
        )
    else:
        print(f"This file is not in a folder")

    # Clean up the local file after upload
    try:
        os.remove(filename)
    except Exception as e:
        print(f"Could not delete locally downloaded file: {filename}")
        print(e)

    if response.status_code == 200:
        print(f"Uploaded file: {filename} to dataset {dataset_v2_id}")
        return response.json().get("id")
    else:
        print(f"Failed to upload file: {filename} to dataset {dataset_v2_id}")

    return None


def download_and_upload_file(file, all_dataset_folders, dataset_v2_id, headers_v2):
    """Download a file from Clowder v1 and upload it to Clowder v2."""
    filename = file["filename"]
    file_id = file["id"]
    file_folder = file.get("folders", None)

    # Download the file from Clowder v1
    v1_download_url = f"{CLOWDER_V1}/api/files/{file_id}?superAdmin=true"
    print(f"Downloading file: {filename}")
    download_response = requests.get(v1_download_url, headers=clowder_headers_v1)

    with open(filename, "wb") as f:
        f.write(download_response.content)

    # Determine the correct folder in Clowder v2 for the upload
    matching_folder = None
    if file_folder:
        matching_folder = next(
            (
                folder
                for folder in all_dataset_folders
                if folder["name"] == file_folder["name"]
            ),
            None,
        )

    # Upload the file to Clowder v2
    dataset_file_upload_endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/files"
    if matching_folder:
        dataset_file_upload_endpoint += f"Multiple?folder_id={matching_folder['id']}"
    response = requests.post(
        dataset_file_upload_endpoint,
        headers=headers_v2,
        files={"file": open(filename, "rb")},
    )

    # Clean up the local file after upload
    try:
        os.remove(filename)
    except Exception as e:
        print(f"Could not delete locally downloaded file: {filename}")
        print(e)

    if response.status_code == 200:
        print(f"Uploaded file: {filename} to dataset {dataset_v2_id}")
        return response.json().get("id")
    else:
        print(f"Failed to upload file: {filename} to dataset {dataset_v2_id}")

    return None


def add_file_metadata(file_v1, file_v2_id, headers_v1, headers_v2):
    # Get metadata from Clowder V1
    endpoint = f"{CLOWDER_V1}/api/files/{file_v1['id']}/metadata.jsonld?superAdmin=true"
    metadata_v1 = requests.get(endpoint, headers=headers_v1).json()

    # Iterate through the metadata and post it to Clowder V2
    for metadata in metadata_v1:
        # Extract and map each key-value pair from the metadata's content
        if "content" in metadata:
            for key, value in metadata["content"].items():
                # Define the payload to send to V2
                metadata_payload_v2 = {
                    "definition": key,
                    "content": metadata["content"],
                }

                # Check if the metadata definition exists;
                # if exists, post to user metadat; otherwise, post to machine metadata
                v2_metadata_endpoint = (
                    f"{CLOWDER_V2}/api/v2/files/{file_v2_id}/metadata"
                )
                if check_metadata_definition_exists(
                    CLOWDER_V2, key, headers=headers_v2
                ):
                    response = requests.post(
                        v2_metadata_endpoint,
                        json=metadata_payload_v2,
                        headers=headers_v2,
                    )

                    if response.status_code != 200:
                        print(f"Failed to post file metadata to V2: {response.text}")
                    else:
                        print(f"Successfully posted file metadata to V2: {key}")
                else:
                    if "agent" in metadata and "listener" not in metadata:
                        metadata["listener"] = {
                            "name": "migration",
                            "version": "1",
                            "description": "Migration of metadata from Clowder v1 to Clowder v2",
                        }
                    response = requests.post(
                        v2_metadata_endpoint, json=metadata, headers=headers_v2
                    )

                    if response.status_code != 200:
                        print(f"Failed to post file metadata to V2: {response.text}")
                    else:
                        print("Successfully posted file machine metadata to V2")
                    break  # machine metadata no need to iterate through all the keys


def add_dataset_metadata(dataset_v1, dataset_v2_id, headers_v1, headers_v2):
    # Get metadata from Clowder V1
    endpoint = (
        f"{CLOWDER_V1}/api/datasets/{dataset_v1['id']}/metadata.jsonld?superAdmin=true"
    )
    metadata_v1 = requests.get(endpoint, headers=headers_v1).json()

    # Iterate through the metadata and post it to Clowder V2
    for metadata in metadata_v1:
        # Extract and map each key-value pair from the metadata's content
        if "content" in metadata:
            for key, value in metadata["content"].items():
                # Define the payload to send to V2
                metadata_payload_v2 = {
                    "definition": key,
                    "content": metadata["content"],
                }

                # Check if the metadata definition exists;
                # if exists, post to user metadat; otherwise, post to machine metadata
                v2_metadata_endpoint = (
                    f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/metadata"
                )
                if check_metadata_definition_exists(
                    CLOWDER_V2, key, headers=headers_v2
                ):
                    response = requests.post(
                        v2_metadata_endpoint,
                        json=metadata_payload_v2,
                        headers=headers_v2,
                    )

                    if response.status_code != 200:
                        print(f"Failed to post dataset metadata to V2: {response.text}")
                    else:
                        print(f"Successfully posted dataset metadata to V2: {key}")
                else:
                    if "agent" in metadata and "listener" not in metadata:
                        metadata["listener"] = {
                            "name": "migration",
                            "version": "1",
                            "description": "Migration of metadata from Clowder v1 to Clowder v2",
                        }
                    response = requests.post(
                        v2_metadata_endpoint, json=metadata, headers=headers_v2
                    )

                    if response.status_code != 200:
                        print(f"Failed to post dataset metadata to V2: {response.text}")
                    else:
                        print("Successfully posted dataset machine metadata to V2")
                    break  # machine metadata no need to iterate through all the keys


def register_migration_extractor():
    """Register the migration extractor in Clowder v2."""
    migration_extractor = {
        "name": "migration",
        "description": "Migration of metadata from Clowder v1 to Clowder v2",
        "version": "1",
        "author": "Clowder Devs",
    }

    # check if migration extractor already exists
    search_endpoint = f"{CLOWDER_V2}/api/v2/listeners/search"
    search_params = {"text": migration_extractor["name"]}
    search_response = requests.get(
        search_endpoint, headers=clowder_headers_v2, params=search_params
    )

    # Check if extractor already exists
    if search_response.status_code == 200:
        search_data = search_response.json()
        if search_data.get("metadata", {}).get("total_count", 0) > 0:
            for existing_extractor in search_response.json().get("data", []):
                if existing_extractor.get("name") == migration_extractor["name"]:
                    print(
                        f"Extractor {migration_extractor['name']} already exists in Clowder v2."
                    )
                    return

    endpoint = f"{CLOWDER_V2}/api/v2/extractors"
    response = requests.post(
        endpoint, json=migration_extractor, headers=clowder_headers_v2
    )

    if response.status_code == 200:
        print("Successfully registered migration extractor in Clowder v2.")
    else:
        print(
            f"Failed to register migration extractor in Clowder v2. Status code: {response.status_code}"
        )


def add_children(collection_hierarchy_json, remaining_collections):
    new_json = []
    new_remaining_collections = []
    for collection in remaining_collections:
        collection_parents = collection["parent_collection_ids"]
        current_collection_parents = []
        for entry in collection_hierarchy_json:
            if entry["id"] in collection_parents:
                current_collection_parents.append(entry)
        print("We got the parents now")
        if len(current_collection_parents) > 0:
            current_collection_entry = {
                "id": collection["id"],
                "name": collection["name"],
                "parents": current_collection_parents,
            }
            new_json.append(current_collection_entry)
        else:
            new_remaining_collections.append(collection)
    return new_json, new_remaining_collections


def build_collection_hierarchy(collection_id, headers):
    self_and_ancestors = get_clowder_v1_collection_self_and_ancestors(
        collection_id=collection_id, self_and_ancestors=[], headers=headers
    )
    self_and_ancestors_collections = get_clowder_v1_collections(
        self_and_ancestors, headers=clowder_headers_v1
    )
    children = []
    remaining_collections = []
    for col in self_and_ancestors_collections:
        parent_collection_ids = col["parent_collection_ids"]
        parent_collection_ids = parent_collection_ids.lstrip("List(")
        parent_collection_ids = parent_collection_ids.rstrip(")")
        parent_collection_ids = parent_collection_ids.lstrip(" ")
        parent_collection_ids = parent_collection_ids.rstrip(" ")
        if parent_collection_ids == "":
            root_col_entry = {"name": col["name"], "id": col["id"], "parents": []}
            children.append(root_col_entry)
        else:
            remaining_collections.append(col)

    while len(remaining_collections) > 0:
        children, remaining_collections = add_children(children, remaining_collections)
    print("Now we are done")
    return children


def build_collection_metadata_for_v1_dataset(dataset_id, user_v1, headers):
    dataset_collections = get_clowder_v1_dataset_collections(
        headers=headers, user_v1=user_v1, dataset_id=dataset_id
    )
    return dataset_collections


def build_collection_space_metadata_for_v1_dataset(dataset, user_v1, headers):
    dataset_id = dataset["id"]
    dataset_collections = []
    if dataset_id in DATASET_COLLECTIONS_MAP:
        dataset_collections_ids = DATASET_COLLECTIONS_MAP[dataset_id]
        for col_id in dataset_collections_ids:
            collection = get_clowder_v1_collection(col_id, headers=headers)
            dataset_collections.append(collection)
    dataset_spaces = dataset["spaces"]
    space_entries = []
    for space_id in dataset_spaces:
        space_endpoint = f"{CLOWDER_V1}/api/spaces/{space_id}"
        response = requests.get(space_endpoint, headers=headers)
        space = response.json()
        try:
            space_entry = {
                "id": space["id"],
                "name": space["name"],
                # TODO this is not part of the json
                "creator": space["creator"],
            }
            space_entries.append(space_entry)
        except Exception as e:
            print(f"Error in getting space entry.")
            print(e)
            try:
                space_entry = {"id": space["id"], "name": space["name"]}
                space_entries.append(space_entry)
            except Exception as e:
                print(f"Error in getting space entry")
                print(e)
    collection_data = []
    for collection in dataset_collections:
        collection_children = build_collection_hierarchy(
            collection_id=collection["id"], headers=headers
        )
        for child in collection_children:
            collection_data.append(child)
    metadata = {"spaces": space_entries, "collections": collection_data}
    print(f"Got space and collection metadata from dataset {dataset_id}")
    return metadata

def process_user_and_resources_collections(user_v1, USER_MAP, DATASET_MAP, COLLETIONS_MAP):
    """Process user resources from Clowder v1 to Clowder v2."""

    # get collections of the user

    user_v1_datasets = get_clowder_v1_user_datasets(user_id=user_v1["id"])
    user_v1_datasets = user_v1_datasets[:2]
    user_v2_api_key = create_local_user(user_v1)
    USER_MAP[user_v1["id"]] = user_v2_api_key
    base_user_headers_v2 = {"x-api-key": user_v2_api_key}
    user_headers_v2 = {
        "x-api-key": user_v2_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }

    user_v1_collections = get_clowder_v1_user_collections_top_level(
        headers=clowder_headers_v1, user_v1=user_v1
    )

    print(f"Got {len(user_v1_collections)} user collections in the top level")

    for top_level_col in user_v1_collections:
        dataset_v2 = create_v2_dataset_from_collection(top_level_col, user_v1, clowder_headers_v1, user_headers_v2)
        print('did this')

    for dataset in user_v1_datasets:
        print(f"Creating dataset in v2: {dataset['id']} - {dataset['name']}")
        dataset_v1_id = dataset["id"]
        dataset_v1_spaces = dataset["spaces"]
        MIGRATE_DATASET = True
        print(toml_exclude_dataset_ids)
        print(toml_space_ids)
        print(toml_exclude_space_ids)
        # Check if dataset is in the excluded dataset list
        if dataset_v1_id in toml_exclude_dataset_ids:
            print(f"Skipping dataset {dataset_v1_id} as it is in the exclude list.")
            MIGRATE_DATASET = False
        # Check if dataset is in the specified space list
        if toml_space_ids is not None and len(toml_space_ids) > 0:
            if not any(
                space_id in dataset_v1_spaces for space_id in toml_space_ids
            ):
                print(
                    f"Skipping dataset {dataset_v1_id} as it is not in the specified spaces."
                )
                MIGRATE_DATASET = False
        if toml_exclude_space_ids is not None and len(toml_exclude_space_ids) > 0:
            if any(
                space_id in dataset_v1_spaces for space_id in toml_exclude_space_ids
            ):
                print(
                    f"Skipping dataset {dataset_v1_id} as it is in the excluded spaces."
                )
                MIGRATE_DATASET = False
        if MIGRATE_DATASET:
            dataset_v2_id = create_v2_dataset(dataset, user_headers_v2)
            DATASET_MAP[dataset["id"]] = dataset_v2_id
            add_dataset_metadata(dataset, dataset_v2_id, base_headers_v1, user_headers_v2)
            add_dataset_folders(dataset, dataset_v2_id, user_headers_v2)
            print("Created folders in the new dataset")

            all_dataset_folders = get_folder_and_subfolders(dataset_v2_id, user_headers_v2)

            # Retrieve files for the dataset in Clowder v1
            dataset_files_endpoint = (
                f"{CLOWDER_V1}/api/datasets/{dataset['id']}/files?superAdmin=true"
            )
            files_response = requests.get(
                dataset_files_endpoint, headers=clowder_headers_v1, verify=False
            )
            files_result = files_response.json()

            for file in files_result:
                file_v2_id = download_and_upload_file(
                    file, all_dataset_folders, dataset_v2_id, base_user_headers_v2
                )
                if file_v2_id is not None:
                    add_file_metadata(file, file_v2_id, clowder_headers_v1, user_headers_v2)
            # posting the collection hierarchy as metadata
            try:
                collection_space_metadata_dict = build_collection_space_metadata_for_v1_dataset(
                    dataset=dataset, user_v1=user_v1, headers=clowder_headers_v1
                )
            except Exception as e:
                print(e)
            migration_extractor_collection_metadata = {
                "listener": {
                    "name": "migration",
                    "version": "1",
                    "description": "Migration of metadata from Clowder v1 to Clowder v2",
                },
                "context_url": "https://clowder.ncsa.illinois.edu/contexts/metadata.jsonld",
                "content": collection_space_metadata_dict,
                "contents": collection_space_metadata_dict,
            }
            v2_metadata_endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/metadata"
            response = requests.post(
                v2_metadata_endpoint,
                json=migration_extractor_collection_metadata,
                headers=clowder_headers_v2,
            )
            if response.status_code == 200:
                print("Successfully added collection info as metadata in v2.")
            else:
                print(
                    f"Failed to add collection info as metadata in Clowder v2. Status code: {response.status_code}"
                )
        else:
            print(f"Skipping dataset {dataset_v1_id} as it does not meet the criteria.")

    return [USER_MAP, DATASET_MAP]


def process_user_and_resources(user_v1, USER_MAP, DATASET_MAP):
    """Process user resources from Clowder v1 to Clowder v2."""
    user_v1_datasets = get_clowder_v1_user_datasets(user_id=user_v1["id"])
    user_v1_datasets = user_v1_datasets[:2]
    user_v2_api_key = create_local_user(user_v1)
    USER_MAP[user_v1["id"]] = user_v2_api_key
    base_user_headers_v2 = {"x-api-key": user_v2_api_key}
    user_headers_v2 = {
        "x-api-key": user_v2_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }

    for dataset in user_v1_datasets:
        print(f"Creating dataset in v2: {dataset['id']} - {dataset['name']}")
        dataset_v1_id = dataset["id"]
        dataset_v1_spaces = dataset["spaces"]
        MIGRATE_DATASET = True
        print(toml_exclude_dataset_ids)
        print(toml_space_ids)
        print(toml_exclude_space_ids)
        # Check if dataset is in the excluded dataset list
        if dataset_v1_id in toml_exclude_dataset_ids:
            print(f"Skipping dataset {dataset_v1_id} as it is in the exclude list.")
            MIGRATE_DATASET = False
        # Check if dataset is in the specified space list
        if toml_space_ids is not None and len(toml_space_ids) > 0:
            if not any(
                space_id in dataset_v1_spaces for space_id in toml_space_ids
            ):
                print(
                    f"Skipping dataset {dataset_v1_id} as it is not in the specified spaces."
                )
                MIGRATE_DATASET = False
        if toml_exclude_space_ids is not None and len(toml_exclude_space_ids) > 0:
            if any(
                space_id in dataset_v1_spaces for space_id in toml_exclude_space_ids
            ):
                print(
                    f"Skipping dataset {dataset_v1_id} as it is in the excluded spaces."
                )
                MIGRATE_DATASET = False
        if MIGRATE_DATASET:
            dataset_v2_id = create_v2_dataset(dataset, user_headers_v2)
            DATASET_MAP[dataset["id"]] = dataset_v2_id
            add_dataset_metadata(dataset, dataset_v2_id, base_headers_v1, user_headers_v2)
            add_dataset_folders(dataset, dataset_v2_id, user_headers_v2)
            print("Created folders in the new dataset")

            all_dataset_folders = get_folder_and_subfolders(dataset_v2_id, user_headers_v2)

            # Retrieve files for the dataset in Clowder v1
            dataset_files_endpoint = (
                f"{CLOWDER_V1}/api/datasets/{dataset['id']}/files?superAdmin=true"
            )
            files_response = requests.get(
                dataset_files_endpoint, headers=clowder_headers_v1, verify=False
            )
            files_result = files_response.json()

            for file in files_result:
                file_v2_id = download_and_upload_file(
                    file, all_dataset_folders, dataset_v2_id, base_user_headers_v2
                )
                if file_v2_id is not None:
                    add_file_metadata(file, file_v2_id, clowder_headers_v1, user_headers_v2)
            # posting the collection hierarchy as metadata
            try:
                collection_space_metadata_dict = build_collection_space_metadata_for_v1_dataset(
                    dataset=dataset, user_v1=user_v1, headers=clowder_headers_v1
                )
            except Exception as e:
                print(e)
            migration_extractor_collection_metadata = {
                "listener": {
                    "name": "migration",
                    "version": "1",
                    "description": "Migration of metadata from Clowder v1 to Clowder v2",
                },
                "context_url": "https://clowder.ncsa.illinois.edu/contexts/metadata.jsonld",
                "content": collection_space_metadata_dict,
                "contents": collection_space_metadata_dict,
            }
            v2_metadata_endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/metadata"
            response = requests.post(
                v2_metadata_endpoint,
                json=migration_extractor_collection_metadata,
                headers=clowder_headers_v2,
            )
            if response.status_code == 200:
                print("Successfully added collection info as metadata in v2.")
            else:
                print(
                    f"Failed to add collection info as metadata in Clowder v2. Status code: {response.status_code}"
                )
        else:
            print(f"Skipping dataset {dataset_v1_id} as it does not meet the criteria.")

    return [USER_MAP, DATASET_MAP]


if __name__ == "__main__":
    ##############################################################################################################
    # migrate metadata definition
    v1_md_definitions = get_clowder_v1_metadata_definitions(CLOWDER_V1, base_headers_v1)
    posted_ids = []
    for v1_md in v1_md_definitions:
        definition_id = post_metadata_definition(v1_md, CLOWDER_V2, clowder_headers_v2)
        if definition_id:
            posted_ids.append(definition_id)

    ##############################################################################################################
    # Register the migration extractor in Clowder v2
    register_migration_extractor()

    ##############################################################################################################
    # migrate users and resources
    USER_MAP = {}
    DATASET_MAP = {}
    COLLECTIONS_MAP = {}
    users_v1 = get_clowder_v1_users()

    if toml_users is not None and len(toml_users) > 0:
        print(f"Using spaces from config.toml: {toml_users}")
        users_v1 = [
            user for user in users_v1 if user["email"] in toml_users
        ]
    else:
        print("No spaces specified in config.toml, migrating all users.")
    for user_v1 in users_v1:
        if (
            "[Local Account]" in user_v1["identityProvider"]
            and user_v1["email"] != admin_user["email"]
        ):
            [USER_MAP, DATASET_MAP] = process_user_and_resources_collections(
                user_v1, USER_MAP, DATASET_MAP, COLLECTIONS_MAP
            )
            print(f"Migrated user {user_v1['email']} and associated resources.")
        else:
            print(f"Skipping user {user_v1['email']} as it is not a local account.")

    ##############################################################################################################
    # migrate spaces
    print("Now migrating spaces.")
    for user_v1 in users_v1:
        print(f"Migrating spaces of user {user_v1['email']}")
        user_v1_spaces = get_clowder_v1_user_spaces(user_v1)
        user_v2_api_key = USER_MAP[user_v1["id"]]
        for space in user_v1_spaces:
            group_id = create_v2_group(space, headers={"X-API-key": user_v2_api_key})
            add_v1_space_members_to_v2_group(
                space, group_id, headers={"X-API-key": user_v2_api_key}
            )
            space_datasets = get_clowder_v2_space_datasets(space["id"])
            for space_dataset in space_datasets:
                dataset_v2_id = DATASET_MAP[space_dataset["id"]]
                share_dataset_with_group(
                    group_id, space, headers={"X-API-key": user_v2_api_key}
                )
        print(f"Migrated spaces of user {user_v1['email']}")
    print("Migration complete.")
