import os
from fastapi.testclient import TestClient
from app.config import settings
from app.models.pyobjectid import PyObjectId
from app.tests.test_files import dataset_data

user = {
    "email": "test@test.org",
    "password": "not_a_password",
    "first_name": "Foo",
    "last_name": "Bar",
}

extractor_info = {
    "@context": "http://clowder.ncsa.illinois.edu/contexts/extractors.jsonld",
    "name": "ncsa.wordcount",
    "version": "2.0",
    "description": "WordCount extractor. Counts the number of characters, words and lines in the text file that was uploaded.",
    "contributors": [],
    "contexts": [
        {
            "lines": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#lines",
            "words": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#words",
            "characters": "http://clowder.ncsa.illinois.edu/metadata/ncsa.wordcount#characters",
        }
    ],
    "repository": [
        {
            "repType": "git",
            "repUrl": "https://opensource.ncsa.illinois.edu/stash/scm/cats/pyclowder.git",
        }
    ],
    "process": {"file": ["text/*", "application/json"]},
    "external_services": [],
    "dependencies": [],
    "bibtex": [],
}

# extractor_info_file = os.path.join(os.getcwd(), 'extractor_info.json')
dummy_file = "trigger_test.txt"


def test_register(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/listeners", json=extractor_info, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200


def test_get_one(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/listeners", json=extractor_info, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    extractor_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/listeners/{extractor_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/listeners", json=extractor_info, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    extractor_id = response.json().get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/listeners/{extractor_id}", headers=headers
    )
    assert response.status_code == 200


def test_v1_mime_trigger(client: TestClient, headers: dict):
    # Create the listener
    response = client.post(
        f"{settings.API_V2_STR}/extractors", json=extractor_info, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    extractor_id = response.json().get("id")

    # Verify feeds were created for the process rules
    response = client.get(
        f"{settings.API_V2_STR}/feeds?name={extractor_info['name']}", headers=headers
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

    # Upload a text file and verify a job is created

    # Create dataset to hold file
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200

    # Upload test file to dataset
    dataset_id = response.json().get("id")
    with open(dummy_file, "w") as dummy:
        dummy.write("1,2,3")
    file_data = {"file": open(dummy_file, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(dummy_file)
    assert response.status_code == 200

    # Check if job exists
