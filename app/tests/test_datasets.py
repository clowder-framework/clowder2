from fastapi.testclient import TestClient
from app.config import settings

dataset_data = {
    "name": "first dataset",
    "description": "a dataset is a container of files and metadata",
    "views": 0,
    "downloads": 0,
}

user = {"name": "test@test.org", "password": "not_a_password"}


def test_create(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/users", json=user)
    assert response.status_code == 200
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_get_one(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.get(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        f"{settings.API_V2_STR}/datasets", headers=headers, json=dataset_data
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.delete(
        f"{settings.API_V2_STR}/datasets/{dataset_id}", headers=headers
    )
    assert response.status_code == 200


def test_edit(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    new_dataset = response.json()
    new_dataset["name"] = "edited name"
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=new_dataset, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_list(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post(
        f"{settings.API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    assert response.status_code == 200
    assert response.json().get("id") is not None
    assert response.status_code == 200
    response = client.get(f"{settings.API_V2_STR}/datasets", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0
