import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

dataset_data = {
    "name": "first dataset",
    "description": "a dataset is a container of files and metadata",
    "views": 0,
    "downloads": 0,
}

user = {"name": "test@test.org", "password": "not_a_password"}


def test_create():
    response = client.post("/users", json=user)
    assert response.status_code == 200
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    print(f"\nAccess Token: {token}\n")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/datasets", headers=headers, json=dataset_data)
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_get_one():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    print(f"\nAccess Token: {token}\n")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/datasets", headers=headers, json=dataset_data)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.get(f"/datasets/{dataset_id}")
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_delete():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/datasets", headers=headers, json=dataset_data)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    dataset_id = response.json().get("id")
    response = client.delete(f"/datasets/{dataset_id}", headers=headers)
    assert response.status_code == 200


def test_edit():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset_data, headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    new_dataset = response.json()
    new_dataset["name"] = "edited name"
    response = client.post("/datasets", json=new_dataset, headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_list():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset_data, headers=headers)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    response = client.get("/datasets", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0
