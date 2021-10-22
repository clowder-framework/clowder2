from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

item = {
    "name": "first item",
    "price": 3,
    "is_offer": "true",
    "value": {"parity": "odd", "value": 5},
}


def test_create():
    response = client.post("/items", json=item)
    assert response.json().get("_id") is not None
    assert response.status_code == 200


def test_get_one():
    response = client.post("/items", json=item)
    item_id = response.json().get("_id")
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    assert response.json().get("_id") is not None


def test_list():
    response = client.post("/items", json=item)
    assert response.json().get("_id") is not None
    response = client.get("/items")
    assert response.status_code == 200
    assert len(response.json()) > 0
