from app.config import settings
from fastapi.testclient import TestClient

item = {
    "name": "first item",
    "price": 3,
    "is_offer": "true",
    "value": {"parity": "odd", "value": 5},
}


def test_create(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/items", json=item)
    assert response.json().get("id") is not None
    assert response.status_code == 200


def test_get_one(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/items", json=item)
    item_id = response.json().get("id")
    response = client.get(f"{settings.API_V2_STR}/items/{item_id}")
    assert response.status_code == 200
    assert response.json().get("id") is not None


def test_list(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/items", json=item)
    assert response.json().get("id") is not None
    response = client.get(f"{settings.API_V2_STR}/items")
    assert response.status_code == 200
    assert len(response.json()) > 0
