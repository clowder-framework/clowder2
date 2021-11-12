from fastapi.testclient import TestClient

from app.main import app, API_V2_STR

client = TestClient(app)

user = {"name": "test@test.org", "password": "not_a_password"}


def test_signup():
    response = client.post(f"{API_V2_STR}/users/", json=user)
    assert response.status_code == 200


def test_signin():
    response = client.post(f"{API_V2_STR}/signin", json=user)
    assert response.status_code == 200


def test_login():
    response = client.post(f"{API_V2_STR}/login", json=user)
    assert response.status_code == 200


def test_token():
    response = client.get(f"{API_V2_STR}/protected")
    assert response.status_code == 403
    response = client.post(f"{API_V2_STR}/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.get(f"{API_V2_STR}/protected", headers=headers)
    assert response.status_code == 200
