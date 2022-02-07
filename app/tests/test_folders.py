from fastapi.testclient import TestClient
from app.config import settings

dataset = {"name": "Dataset with nested folders", "description": ""}

folder1 = {
    "name": "top folder",
}

user = {"name": "test@test.org", "password": "not_a_password"}


def test_create_nested(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/users", json=user)
    assert response.status_code == 200
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    # create dataset
    dataset_res = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset, headers=headers
    )
    assert dataset_res.status_code == 200
    assert dataset_res.json().get("id") is not None
    dataset_id = dataset_res.json().get("id")
    # create top level folder
    top_folder_res = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders",
        json=folder1,
        headers=headers,
    )
    assert top_folder_res.status_code == 200
    assert top_folder_res.json().get("id") is not None
    folder1_id = top_folder_res.json().get("id")
    # create nested folder
    nested_folder = {"name": "nested folder", "parent_folder": folder1_id}
    top_folder_res = client.post(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders",
        json=nested_folder,
        headers=headers,
    )
    assert top_folder_res.status_code == 200
    assert top_folder_res.json().get("id") is not None
    # list top level folders
    top_folders_res = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders",
        headers=headers,
    )
    assert top_folders_res.status_code == 200
    assert len(top_folders_res.json()) == 1
    # list nested folders
    nested_folders_res = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}/folders?parent_folder={folder1_id}",
        headers=headers,
    )
    assert nested_folders_res.status_code == 200
    assert len(nested_folders_res.json()) == 1
