import os
from fastapi.testclient import TestClient
from app.config import settings
from app.models.pyobjectid import PyObjectId

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
    "author": "Rob Kooper <kooper@illinois.edu>",
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
