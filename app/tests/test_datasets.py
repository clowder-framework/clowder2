from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

dataset = {
    "name": "first dataset",
    "description": "a dataset is a container of files and metadata",
    "views": 0,
    "downloads": 0,
}

user = {"name": "test@test.org", "password": "not_a_password"}


def test_create():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200


def test_get_one():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200
    dataset_id = response.json().get("_id")
    response = client.get(f"/datasets/{dataset_id}")
    assert response.status_code == 200
    assert response.json().get("_id") is not None

def test_delete():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200
    response = client.delete("/datasets", headers=headers)
    assert response.status_code == 200

def test_edit():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200
    new_dataset = response.json()
    new_dataset["name"] = "edited name"
    response = client.post("/datasets", json=new_dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200




def test_list():
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.post("/datasets", json=dataset, headers=headers)
    assert response.json().get("_id") is not None
    assert response.status_code == 200
    response = client.get("/datasets", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0

if __name__ == '__main__':
    test_edit()
