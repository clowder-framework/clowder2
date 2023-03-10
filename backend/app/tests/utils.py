from fastapi.testclient import TestClient
from app.config import settings

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


def create_group(client: TestClient, headers: dict):
    """Creates a test group (creator will be auto-added to members) and returns the ID."""
    response = client.post(
        f"{settings.API_V2_STR}/groups", json=group_example, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_dataset(client: TestClient, headers: dict):
    """Creates a test dataset and returns the ID."""
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_example
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()
