import os
import struct

from elasticsearch import Elasticsearch
from fastapi.testclient import TestClient
from pymongo import MongoClient

from app.config import settings
from app.keycloak_auth import delete_user

"""These are standard JSON entries to be used for creating test resources."""
user_example = {
    "email": "test@test.org",
    "password": "not_a_password",
    "first_name": "Foo",
    "last_name": "Bar",
}

user_alt = {
    "email": "test2@test.org",
    "password": "not_a_password",
    "first_name": "test",
    "last_name": "user",
}

group_example = {
    "name": "test group",
    "description": "a group is a container of several users",
}

dataset_example = {
    "name": "test dataset",
    "description": "a dataset is a container of files and metadata",
}

project_example = {
    "name": "test_project",
    "description": "This project is a test",
    "creator": user_example,
}

license_example = {
    "name": "test license",
    "description": "test description",
    "url": "test url",
    "holders": " test holders",
}

filename_example_1 = "test_upload1.csv"
file_content_example_1 = "year,location,count\n2023,Atlanta,4"

filename_example_2 = "test_upload2.csv"
file_content_example_2 = "year,location,count\n2022,Seattle,2"

listener_v2_example = {
    "name": "test.listener_v2_example",
    "version": 2,
    "description": "Created for testing purposes.",
}

feed_example = {
    "name": "test.feed_example",
    "search": {
        "index_name": (
            "clowder-tests"
        ),  # If settings.elasticsearch_index is used, conftest values won't be ready yet!!!
        "criteria": [{"field": "content_type_main", "operator": "==", "value": "text"}],
    },
}

extractor_info_v1_example = {
    "@context": "http://clowder.ncsa.illinois.edu/contexts/extractors.jsonld",
    "name": "test.extractor_info_v1_example",
    "version": "4.0",
    "description": "For testing back-compatiblity with v1-format extractor_info JSON. Based on wordcount.",
    "contributors": [],
    "contexts": [
        {
            "lines": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#lines",
            "words": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#words",
            "characters": (
                "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#characters"
            ),
        }
    ],
    "repository": [
        {
            "repType": "git",
            "repUrl": (
                "https://opensource.ncsa.illinois.edu/stash/scm/cats/pyclowder.git"
            ),
        }
    ],
    "process": {"file": ["text/*", "application/json"]},
    "external_services": [],
    "dependencies": [],
    "bibtex": [],
}

"""CONVENIENCE FUNCTIONS FOR COMMON ACTIONS REQUIRED BY TESTS."""


def create_user(client: TestClient, headers: dict, email: str = user_alt["email"]):
    """Create additional users e.g. for permissions testing (defaults to user_alt) and returns the JSON."""
    u = dict(user_alt)
    u["email"] = email
    response = client.post(f"{settings.API_V2_STR}/users", json=u)
    assert (
            response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists
    return response.json()


def delete_test_data():
    delete_user(user_example["email"])
    delete_user(user_alt["email"])
    mongo_client = MongoClient(settings.MONGODB_URL)
    mongo_client.drop_database("clowder-tests")
    es_client = Elasticsearch(settings.elasticsearch_url)
    es_client.options(ignore_status=[400, 404]).indices.delete(index="clowder-tests")


def get_user_token(client: TestClient, headers: dict, email: str = user_alt["email"]):
    """Get a token header for one of the testing users."""
    u = dict(user_alt)
    u["email"] = email
    response = client.post(f"{settings.API_V2_STR}/login", json=u)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    return {"Authorization": "Bearer " + token}


def create_apikey(client: TestClient, headers: dict):
    """create user generated API key"""
    response = client.post(
        f"{settings.API_V2_STR}/users/keys?name=pytest&mins=30", headers=headers
    )
    assert response.status_code == 200
    assert response.json() is not None
    return response.json()


def create_group(client: TestClient, headers: dict):
    """Creates a test group (creator will be auto-added to members) and returns the JSON."""
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_example, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_dataset(client: TestClient, headers: dict):
    """Creates a test dataset and returns the JSON."""
    license_id = "CC BY"
    response = client.post(
        f"{settings.API_V2_STR}/datasets/?license_id={license_id}",
        headers=headers,
        json=dataset_example,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_dataset_with_custom_license(client: TestClient, headers: dict):
    """Creates a test dataset and returns the JSON."""
    # create
    response = client.post(
        f"{settings.API_V2_STR}/licenses/?user=test@test.org",
        headers=headers,
        json=license_example,
    )
    license_id = response.json().get("id")
    response = client.post(
        f"{settings.API_V2_STR}/datasets/?license_id={license_id}",
        headers=headers,
        json=dataset_example,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_project(client: TestClient, headers: dict):
    """Creates a test dataset and returns the JSON."""
    response = client.post(
        f"{settings.API_V2_STR}/projects",
        headers=headers,
        json=project_example,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def upload_file(
        client: TestClient,
        headers: dict,
        dataset_id: str,
        filename=filename_example_1,
        content=file_content_example_1,
):
    """Uploads a dummy file (optionally with custom name/content) to a dataset and returns the JSON."""
    with open(filename, "w") as tempf:
        tempf.write(content)
    file_data = {"file": open(filename, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(filename)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def upload_files(
        client: TestClient,
        headers: dict,
        dataset_id: str,
        filenames=[filename_example_1, filename_example_2],
        file_contents=[file_content_example_1, file_content_example_2],
):
    """Uploads a dummy file (optionally with custom name/content) to a dataset and returns the JSON."""
    upload_files = []
    for i in range(0, len(filenames)):
        with open(filenames[i], "w") as tempf:
            tempf.write(file_contents[i])
            upload_files.append(filenames[i])
    files = [
        ("files", open(filename_example_1, "rb")),
        ("files", open(filename_example_2, "rb")),
    ]
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/filesMultiple",
        headers=headers,
        files=files,
    )
    for f in upload_files:
        os.remove(f)
    assert response.status_code == 200
    json_response = response.json()
    assert len(json_response) == 2
    return response.json()


def create_folder(
        client: TestClient,
        headers: dict,
        dataset_id: str,
        name="test folder",
        parent_folder=None,
):
    """Creates a folder (optionally under an existing folder) in a dataset and returns the JSON."""
    folder_data = {"name": name}
    if parent_folder:
        folder_data["parent_folder"] = parent_folder
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders",
        json=folder_data,
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def register_v1_extractor(client: TestClient, headers: dict, name: str = None):
    """Registers a new v1 listener (extractor) and returns the JSON."""
    new_extractor = extractor_info_v1_example
    if name:
        new_extractor["name"] = name
    response = client.post(
        f"{settings.API_V2_STR}/extractors", json=new_extractor, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def register_v2_listener(client: TestClient, headers: dict, name: str = None):
    """Registers a new v2 listener and returns the JSON. Note that this typically uses RabbitMQ heartbeat."""
    listener_info = listener_v2_example
    if name is not None:
        listener_info["name"] = name
    response = client.post(
        f"{settings.API_V2_STR}/listeners", json=listener_v2_example, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def generate_png(file_path):
    """Generate a small 16x16 black PNG file for tests that need images. Written like this to avoid dependency on something like Pillow."""
    # PNG signature
    signature = b"\x89PNG\r\n\x1a\n"

    # IHDR chunk (image header)
    ihdr_data = struct.pack("!I4sIIBB", 13, b"IHDR", 16, 16, 8, 0)
    ihdr_crc = struct.pack("!I", 0xDEADBEEF)  # Placeholder CRC value

    # IDAT chunk (image data)
    idat_data = struct.pack("!I4s", 0, b"IDAT")
    idat_crc = struct.pack("!I", 0xDEADBEEF)  # Placeholder CRC value

    # IEND chunk (image trailer)
    iend_data = struct.pack("!I4s", 0, b"IEND")
    iend_crc = struct.pack("!I", 0xAE426082)  # CRC value for IEND

    with open(file_path, "wb") as png_file:
        png_file.write(signature)
        png_file.write(ihdr_data)
        png_file.write(ihdr_crc)
        png_file.write(idat_data)
        png_file.write(idat_crc)
        png_file.write(iend_data)
        png_file.write(iend_crc)
