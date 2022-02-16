from fastapi.testclient import TestClient
from app.config import settings

user = {"email": "test@test.org", "password": "not_a_password"}


def test_signup(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/users", json=user)
    assert response.status_code == 200


def test_login(client: TestClient):
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200


def test_token(client: TestClient):
    response = client.get(f"{settings.API_V2_STR}/protected")
    assert response.status_code == 403
    response = client.post(f"{settings.API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.get(f"{settings.API_V2_STR}/protected", headers=headers)
    assert response.status_code == 200
