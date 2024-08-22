import asyncio
import os
from secrets import token_urlsafe

import nest_asyncio
import requests
from app.config import settings
from app.models.files import FileDB, FileDBViewList, FileOut, LocalFileIn, StorageType
from app.routers.files import add_file_entry
from bson import ObjectId
from dotenv import dotenv_values, load_dotenv
from faker import Faker
from itsdangerous.url_safe import URLSafeSerializer
from minio import Minio
from pymongo import MongoClient

nest_asyncio.apply()
from app import dependencies
from app.models.users import UserAPIKeyDB, UserDB, UserOut
from beanie import init_beanie
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pika.adapters.blocking_connection import BlockingChannel

mongo_client = MongoClient("mongodb://localhost:27018", connect=False)
mongo_client_v2 = MongoClient("mongodb://localhost:27017", connect=False)
db = mongo_client["clowder"]
db_v2 = mongo_client_v2["clowder2"]
print("got the db")
v1_users = db["social.users"].find({})
for u in v1_users:
    print(u)

app = FastAPI()


@app.on_event("startup")
async def start_db():
    client = AsyncIOMotorClient(str(settings.MONGODB_URL))
    await init_beanie(
        database=getattr(client, settings.MONGO_DATABASE),
        # Make sure to include all models. If one depends on another that is not in the list it is not clear which one is missing.
        document_models=[
            FileDB,
            FileDBViewList,
            UserDB,
            UserAPIKeyDB,
        ],
        recreate_views=True,
    )


asyncio.run(start_db())
output_file = "new_users.txt"


fake = Faker()

path_to_env = os.path.join(os.getcwd(), ".env")
print(os.path.isfile(path_to_env))
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]

CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]
# ADMIN_KEY_V2 = 'eyJ1c2VyIjoiYUBhLmNvbSIsImtleSI6IlU1dllaWnB4elNDREl1Q0xObDZ3TWcifQ.LRiLqSH0fJlFSObKrNz-qexkoHw'
base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
clowder_headers_v1 = {
    **base_headers_v1,
    "Content-type": "application/json",
    "accept": "application/json",
}

base_headers_v2 = {"X-API-key": ADMIN_KEY_V2}
clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}

TEST_DATASET_NAME = "Migration Test Dataset"
# TODO this is just for testing
DEFAULT_PASSWORD = "Password123&"


def email_user_new_login(user):
    print("login to the new clowder instance")


def generate_user_api_key(user, password):
    user_example = {
        "email": user["email"],
        "password": password,
        "first_name": user["first_name"],
        "last_name": user["last_name"],
    }
    login_endpoint = CLOWDER_V2 + "api/v2/login"
    response = requests.post(login_endpoint, json=user_example)
    token = response.json().get("token")
    current_headers = {"Authorization": "Bearer " + token}
    auth = {"username": user["email"], "password": password}
    api_key_endpoint = CLOWDER_V2 + "api/v2/users/keys?name=migration&mins=0"
    result = requests.post(api_key_endpoint, headers=current_headers)
    api_key = result.json()
    return api_key


def get_clowder_v1_users():
    endpoint = CLOWDER_V1 + "api/users"
    print(base_headers_v1)
    r = requests.get(endpoint, headers=clowder_headers_v1, verify=False)
    return r.json()


def get_clowder_v2_users():
    endpoint = CLOWDER_V2 + "api/v2/users"
    r = requests.get(endpoint, headers=base_headers_v2, verify=False)
    return r.json()


def get_clowder_v2_user_by_name(username):
    endpoint = CLOWDER_V2 + "api/v2/users/username/" + username
    r = requests.get(endpoint, headers=base_headers_v2, verify=False)
    return r.json()


async def create_v2_dataset(headers, dataset, user_email):
    print(dataset)
    default_license_id = "CC BY"
    dataset_name = dataset["name"]
    dataset_description = dataset["description"]
    dataset_in_v2_endpoint = (
        CLOWDER_V2 + f"api/v2/datasets?license_id={default_license_id}"
    )
    # create dataset
    dataset_example = {
        "name": dataset_name,
        "description": dataset_description,
    }
    response = requests.post(
        dataset_in_v2_endpoint, headers=headers, json=dataset_example
    )
    return response.json()["id"]


def get_clowder_v1_user_datasets(user_id):
    user_datasets = []
    endpoint = CLOWDER_V1 + "api/datasets?limit=0"
    r = requests.get(endpoint, headers=base_headers_v1, verify=False)
    request_json = r.json()
    for dataset in request_json:
        if dataset["authorId"] == user_id:
            user_datasets.append(dataset)
    return user_datasets


def create_local_user(user_v1):
    first_name = user_v1["firstName"]
    last_name = user_v1["lastName"]
    email = user_v1["email"]
    # password = fake.password(20)
    password = "Password123&"
    user_json = {
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
    }
    response = requests.post(f"{CLOWDER_V2}api/v2/users", json=user_json)
    email_user_new_login(email)
    api_key = generate_user_api_key(user_json, DEFAULT_PASSWORD)
    # api_key = 'aZM2QXJ_lvw_5FKNUB89Vg'
    print("Local user created and api key generated")
    if os.path.exists(output_file):
        print("it exists.")
    else:
        f = open(output_file, "x")
    with open(output_file, "a") as f:
        entry = email + "," + password + "," + api_key + "\n"
        f.write(entry)
    return api_key


def create_admin_user():
    user_json = {
        "email": "a@a.com",
        "password": "admin",
        "first_name": "aa",
        "last_name": "aa",
    }
    response = requests.post(f"{CLOWDER_V2}api/v2/users", json=user_json)
    api_key = generate_user_api_key(user_json, "admin")
    return api_key


async def add_folder_entry_to_dataset(dataset_id, folder_name, current_headers):
    current_dataset_folders = []
    dataset_folder_url = CLOWDER_V2 + "api/v2/datasets/" + dataset_id + "/folders"
    response = requests.get(dataset_folder_url, headers=current_headers)
    response_json = response.json()
    existing_folder_names = dict()
    if "data" in response_json:
        existing_folders = response_json["data"]
        for existing_folder in existing_folders:
            existing_folder_names[existing_folder["name"]] = existing_folder["id"]
    if folder_name.startswith("/"):
        folder_name = folder_name.lstrip("/")
    folder_parts = folder_name.split("/")
    parent = None
    for folder_part in folder_parts:
        folder_data = {"name": folder_part}
        # TODO create or get folder
        if folder_part not in existing_folder_names:
            create_folder_endpoint = (
                CLOWDER_V2 + "api/v2/datasets/" + dataset_id + "/folders"
            )
            folder_api_call = requests.post(
                create_folder_endpoint, json=folder_data, headers=current_headers
            )
            print("created folder")
        else:
            parent = folder_part
            print("this one already exists")
    print("got folder parts")


# gets all folders and subfolders in a dataset
async def get_folder_and_subfolders(dataset_id, folder, current_headers):
    total_folders = []
    if folder:
        path_url = (
            CLOWDER_V2
            + "api/v2/datasets/"
            + dataset_id
            + "/folders_and_files?folder_id="
            + folder["id"]
        )
        folder_result = requests.get(path_url, headers=current_headers)
        folder_json_data = folder_result.json()["data"]
        for data in folder_json_data:
            if data["object_type"] == "folder":
                total_folders.append(data)
    else:
        path_url = CLOWDER_V2 + "api/v2/datasets/" + dataset_id + "/folders"
        folder_result = requests.get(path_url, headers=current_headers)
        folder_json_data = folder_result.json()["data"]
        for data in folder_json_data:
            total_folders.append(data)
        print("we got the base level now")
    current_subfolders = []
    for current_folder in total_folders:
        subfolders = await get_folder_and_subfolders(
            dataset_id, current_folder, current_headers
        )
        current_subfolders += subfolders
    total_folders += current_subfolders
    return total_folders


async def create_folder_if_not_exists_or_get(
    folder, parent, dataset_v2, current_headers
):
    clowder_v2_folder_endpoint = (
        CLOWDER_V2 + "api/v2/datasets/" + dataset_v2 + "/folders"
    )
    current_dataset_folders = await get_folder_and_subfolders(
        dataset_id=dataset_v2, folder=None, current_headers=current_headers
    )
    current_folder_data = {"name": folder}
    found_folder = None
    if parent:
        current_folder_data["parent_folder"] = parent
    for each in current_dataset_folders:
        if each["name"] == folder:
            found_folder = each
    if not found_folder:
        response = requests.post(
            f"{CLOWDER_V2}api/v2/datasets/{dataset_v2}/folders",
            json=current_folder_data,
            headers=current_headers,
        )
        found_folder = response.json()
        print("We just created", found_folder)
    return found_folder


async def add_folder_hierarchy(folder_hierarchy, dataset_v2, current_headers):
    current_dataset_folders = await get_folder_and_subfolders(
        dataset_id=dataset_v2, folder=None, current_headers=current_headers
    )
    folder_json_data = current_dataset_folders
    hierarchy_parts = folder_hierarchy.split("/")
    hierarchy_parts.remove("")
    current_parent = None
    for part in hierarchy_parts:
        result = await create_folder_if_not_exists_or_get(
            part, current_parent, dataset_v2, current_headers=current_headers
        )
        if result:
            current_parent = result["id"]


async def add_dataset_folders(dataset_v1, dataset_v2, current_headers):
    dataset_folders_endpoint = (
        CLOWDER_V1 + "api/datasets/" + dataset_v1["id"] + "/folders?superAdmin=true"
    )
    dataset_folders = requests.get(dataset_folders_endpoint, headers=base_headers_v1)
    dataset_folders_json = dataset_folders.json()
    folder_names = []
    for folder in dataset_folders_json:
        folder_names.append(folder["name"])
    for folder in folder_names:
        new = await add_folder_hierarchy(
            folder_hierarchy=folder,
            dataset_v2=dataset_v2,
            current_headers=current_headers,
        )
        print("added", folder)


async def process_user(
    user_v1,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    print("migrating v1 user", user_v1)
    id = user_v1["id"]
    email = user_v1["email"]
    firstName = user_v1["firstName"]
    lastName = user_v1["lastName"]

    id_provider = user_v1["identityProvider"]
    if "[Local Account]" in user_v1["identityProvider"]:
        # get the v2 users
        # create a user account in v2 with this username
        if email != "a@a.com":
            user_v1_datasets = get_clowder_v1_user_datasets(user_id=id)
            # TODO check if there is already a local user
            user_v2 = create_local_user(user_v1)
            user_v2_api_key = user_v2
            user_base_headers_v2 = {"X-API-key": user_v2_api_key}
            user_headers_v2 = {
                **user_base_headers_v2,
                "Content-type": "application/json",
                "accept": "application/json",
            }
            for dataset in user_v1_datasets:
                print("creating a dataset in v2", dataset["id"], dataset["name"])
                dataset_v2_id = await create_v2_dataset(
                    user_base_headers_v2, dataset, email
                )
                folders = await add_dataset_folders(
                    dataset, dataset_v2_id, user_headers_v2
                )
                print("Created folders in new dataset")

                all_dataset_folders = await get_folder_and_subfolders(
                    dataset_id=dataset_v2_id,
                    folder=None,
                    current_headers=user_headers_v2,
                )
                dataset_files_endpoint = (
                    CLOWDER_V1
                    + "api/datasets/"
                    + dataset["id"]
                    + "/files?=superAdmin=true"
                )
                r_files = requests.get(
                    dataset_files_endpoint, headers=clowder_headers_v1, verify=False
                )
                files_result = r_files.json()
                for file in files_result:
                    file_folder = None
                    file_id = file["id"]
                    filename = file["filename"]
                    if "folders" in file:
                        file_folder = file["folders"]
                    # TODO download the file from v1 using api routes
                    v1_download_url = (
                        CLOWDER_V1 + "api/files/" + file_id + "?superAdmin=true"
                    )
                    print("downloading file", filename)
                    download = requests.get(v1_download_url, headers=clowder_headers_v1)
                    with open(filename, "wb") as f:
                        f.write(download.content)
                    file_data = {"file": open(filename, "rb")}
                    matching_folder = None
                    if file_folder:
                        for folder in all_dataset_folders:
                            if folder["name"] == file_folder["name"]:
                                matching_folder = folder
                    if matching_folder:
                        upload_files = {"files": open(filename, "rb")}
                        dataset_file_upload_endpoint = (
                            CLOWDER_V2
                            + "api/v2/datasets/"
                            + dataset_v2_id
                            + "/filesMultiple?folder_id="
                            + matching_folder["id"]
                        )
                        response = requests.post(
                            dataset_file_upload_endpoint,
                            files=upload_files,
                            headers=user_base_headers_v2,
                        )

                    else:
                        dataset_file_upload_endpoint = (
                            CLOWDER_V2 + "api/v2/datasets/" + dataset_v2_id + "/files"
                        )
                        response = requests.post(
                            dataset_file_upload_endpoint,
                            files=file_data,
                            headers=user_base_headers_v2,
                        )
                    if response.status_code == 200:
                        result = response.json()
                        print("added file", result)
                    try:
                        os.remove(filename)
                    except Exception as e:
                        print("could not delete locally downloaded file")
                        print(e)
                    print("done with file upload")


async def process_users(
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    print("We create a v2 admin user")
    NEW_ADMIN_KEY_V2 = create_admin_user()
    users_v1 = get_clowder_v1_users()
    for user_v1 in users_v1:
        print("migrating v1 user", user_v1)
        id = user_v1["id"]
        email = user_v1["email"]
        firstName = user_v1["firstName"]
        lastName = user_v1["lastName"]

        id_provider = user_v1["identityProvider"]
        if "[Local Account]" in user_v1["identityProvider"]:
            # get the v2 users
            # create a user account in v2 with this username
            await process_user(user_v1, fs=fs, es=es, rabbitmq_client=rabbitmq_client)
            print("Migrated user", user_v1)

        else:
            print("not a local account, not migrated at this time")


asyncio.run(process_users())
