from fastapi.testclient import TestClient
from app.config import settings


authorization_data = {"dataset_id": "6373acfad19c970d5dab6473", "user_id": "lmarini+test@illinois.edu", "role": "owner"}
def test_create(client: TestClient, headers: dict):
    response = client.post(
        f"{settings.API_V2_STR}/authorization", json=authorization_data, headers=headers
    )
    assert response.json().get("id") is not None
    assert response.status_code == 200
