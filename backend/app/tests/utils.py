import os
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

filename_example = "test_upload.csv"
file_content_example = "year,location,count\n2023,Atlanta,4"


def create_user(client: TestClient, headers: dict, email: str = user_alt["email"]):
    """Create additional users e.g. for permissions testing (defaults to user_alt) and returns the JSON."""
    u = dict(user_alt)
    u["email"] = email
    response = client.post(f"{settings.API_V2_STR}/users", json=u)
    assert (
        response.status_code == 200 or response.status_code == 409
    )  # 409 = user already exists
    return response.json()


def get_user_token(client: TestClient, headers: dict, email: str = user_alt["email"]):
    """Get a token header for one of the testing users."""
    u = dict(user_alt)
    u["email"] = email
    response = client.post(f"{settings.API_V2_STR}/login", json=u)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    return {"Authorization": "Bearer " + token}


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
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_example
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def upload_file(client: TestClient, headers: dict, dataset_id: str, filename=filename_example, content=file_content_example):
    """Uploads a dummy file (optionally with custom name/content) to a dataset and returns the JSON."""
    with open(filename, "w") as tempf:
        tempf.write(content)
    file_data = {"file": open(filename, "rb")}
    response = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(tempf)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_folder(client: TestClient, headers: dict, dataset_id: str, name="test folder", parent_folder=None):
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
