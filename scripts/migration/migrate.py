import os
from datetime import datetime

import requests
from dotenv import dotenv_values

# Configuration and Constants
DEFAULT_PASSWORD = "Password123&"

# Get the current timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_FILE = f"migrated_new_users_{timestamp}.log"

# Load environment variables
path_to_env = os.path.join(os.getcwd(), ".env")
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

clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}

admin_user = {
    "email": "a@a.com",
    "password": "admin",
    "first_name": "aa",
    "last_name": "aa",
}


def email_user_new_login(user_email):
    """Send an email to the user with the new login details."""
    print(f"Login to the new Clowder instance: {user_email}")


def generate_user_api_key(user, password):
    """Generate an API key for a user."""
    login_endpoint = f"{CLOWDER_V2}/api/v2/login"
    response = requests.post(login_endpoint, json=user)
    token = response.json().get("token")
    current_headers = {"Authorization": f"Bearer {token}"}

    api_key_endpoint = f"{CLOWDER_V2}/api/v2/users/keys?name=migration&mins=0"
    result = requests.post(api_key_endpoint, headers=current_headers)
    return result.json()


def get_clowder_v1_users():
    """Retrieve all users from Clowder v1."""
    endpoint = f"{CLOWDER_V1}/api/users"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return response.json()


def get_clowder_v1_user_datasets(user_id):
    """Retrieve datasets created by a specific user in Clowder v1."""
    # TODO what about pagination
    endpoint = f"{CLOWDER_V1}/api/datasets?limit=0"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return [dataset for dataset in response.json() if dataset["authorId"] == user_id]


def get_clowder_v1_user_spaces(user_id):
    endpoint = f"{CLOWDER_V1}/api/spaces?limit=0"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return [space for space in response.json() if space["creator"] == user_id]


def get_clowder_v1_user_spaces_members(space_id):
    endpoint = f"{CLOWDER_V1}/api/spaces/{space_id}/users"
    response = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return response.json()


def add_v1_space_members_to_v2_group(space, group_id, headers):
    space_members = get_clowder_v1_user_spaces_members(space["id"])
    for member in space_members:
        member_email = member["email"]
        endpoint = f"{CLOWDER_V2}/api/v2/groups/{group_id}/add/{member_email}"
        response = requests.post(
            endpoint,
            headers=headers,
        )


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
                        user_v1, DEFAULT_PASSWORD
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


def create_v2_dataset(dataset, headers):
    """Create a dataset in Clowder v2."""
    # TODO: GET correct license
    dataset_in_v2_endpoint = f"{CLOWDER_V2}/api/v2/datasets?license_id=CC BY"
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
    current_folders = get_folder_and_subfolders(dataset_v2, headers)
    folder_data = (
        {"name": folder, "parent_folder": parent} if parent else {"name": folder}
    )

    for existing_folder in current_folders:
        if existing_folder["name"] == folder:
            return existing_folder

    response = requests.post(
        f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2}/folders",
        json=folder_data,
        headers=headers,
    )
    return response.json()


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

    with open(filename, "rb") as file_data:
        response = requests.post(
            dataset_file_upload_endpoint, files={"file": file_data}, headers=headers_v2
        )

    if response.status_code == 200:
        print(f"Uploaded file: {filename} to dataset {dataset_v2_id}")

    # Clean up the local file after upload
    try:
        os.remove(filename)
    except Exception as e:
        print(f"Could not delete locally downloaded file: {filename}")
        print(e)
    print(f"Completed upload for file: {filename}")


def process_user_and_resources(user_v1):
    """Process user resources from Clowder v1 to Clowder v2."""
    user_v1_datasets = get_clowder_v1_user_datasets(user_id=user_v1["id"])
    user_v2_api_key = create_local_user(user_v1)
    user_headers_v2 = {
        "x-api-key": user_v2_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }

    user_v1_spaces = get_clowder_v1_user_spaces(user_id=user_v1["id"])
    for space in user_v1_spaces:
        group_id = create_v2_group(space, headers=user_headers_v2)
        add_v1_space_members_to_v2_group(space, group_id, headers=user_headers_v2)

    for dataset in user_v1_datasets:
        print(f"Creating dataset in v2: {dataset['id']} - {dataset['name']}")
        dataset_v2_id = create_v2_dataset(dataset, user_headers_v2)
        add_dataset_folders(dataset, dataset_v2_id, user_headers_v2)
        print("Created folders in the new dataset")

        all_dataset_folders = get_folder_and_subfolders(dataset_v2_id, user_headers_v2)

        # Retrieve files for the dataset in Clowder v1
        dataset_files_endpoint = (
            f"{CLOWDER_V1}api/datasets/{dataset['id']}/files?superAdmin=true"
        )
        files_response = requests.get(
            dataset_files_endpoint, headers=clowder_headers_v1, verify=False
        )
        files_result = files_response.json()

        for file in files_result:
            download_and_upload_file(
                file, all_dataset_folders, dataset_v2_id, user_headers_v2
            )
        # TODO add dataset to space if it is in a space


if __name__ == "__main__":
    # users_v1 = get_clowder_v1_users()
    users_v1 = [
        {
            "@context": {
                "firstName": "http://schema.org/Person/givenName",
                "lastName": "http://schema.org/Person/familyName",
                "email": "http://schema.org/Person/email",
                "affiliation": "http://schema.org/Person/affiliation",
            },
            "id": "576313ce1407b25fe19fc381",
            "firstName": "Chen",
            "lastName": "Wang",
            "fullName": "Chen Wang",
            "email": "cwang138-clowder2@illinois.edu",
            "avatar": "http://www.gravatar.com/avatar/2f97a52f2214949c4172d7fb796f173e?d=404",
            "profile": {},
            "identityProvider": "Chen Wang (cwang138@illinois.edu) [Local Account]",
        }
    ]
    for user_v1 in users_v1:
        if (
            "[Local Account]" in user_v1["identityProvider"]
            and user_v1["email"] != admin_user["email"]
        ):
            process_user_and_resources(user_v1)
            print(f"Migrated user {user_v1['email']} and associated resources.")
        else:
            print(f"Skipping user {user_v1['email']} as it is not a local account.")

    print("Migration complete.")
