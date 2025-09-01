import requests
from dotenv import dotenv_values
import os

path_to_env = os.path.join(os.getcwd(),"scripts","migration", ".env")
path_to_toml = os.path.join(os.getcwd(),"scripts","migration", "config.toml")
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]
CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
base_headers_v2 = {"X-API-key": ADMIN_KEY_V2}

clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}

url = 'http://127.0.0.1:8000/api/v2'

def get_new_dataset_folders(dataset_id, headers):
    endpoint = f"{url}/datasets/{dataset_id}/all_folders"
    r = requests.get(endpoint, headers=headers)
    foldesr_json = r.json()
    print(r.json())

def download_and_upload_file_to_folder(file, folder_id, dataset_v2_id, headers_v2):
    """Download a file from Clowder v1 and upload it to Clowder v2."""


    # Download the file from Clowder v1
    filename = 'test.txt'



    # Upload the file to Clowder v2
    dataset_file_upload_endpoint = f"{CLOWDER_V2}/api/v2/datasets/{dataset_v2_id}/files"
    if folder_id is not None:
        # add folder if it is not None
        # folder_id = folder["id"]
        dataset_file_upload_endpoint += f"Multiple?folder_id={folder_id}"
    file_data = {"file": open(filename, "rb")}
    response = requests.post(
        dataset_file_upload_endpoint,
        headers=headers_v2,
        files=file_data,
    )
    if response.status_code == 200:
        print(f"Uploaded file: {filename} to dataset {dataset_v2_id}")
        return response.json().get("id")
    else:
        print(f"Failed to upload file: {filename} to dataset {dataset_v2_id}")

    return None




test_file = 'july-2018-temperature-precip.csv'
if os.path.exists(test_file):
    print('it exists')

test_folder_id = '68b206b0fb9e6c77930beaab'
test_dataset_id = '68b206a4fb9e6c77930beaa8'

download_and_upload_file_to_folder(test_file, None, test_dataset_id, clowder_headers_v2)

# new_folders = get_new_dataset_folders('68b080ee03137d5052c0872c', headers=clowder_headers_v2)