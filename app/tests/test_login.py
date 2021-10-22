from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

user = {"name": "test@test.org", "password": "not_a_password"}


def test_signup():
    response = client.post("/users", json=user)
    assert response.status_code == 200


def test_signin():
    response = client.post("/signin", json=user)
    assert response.status_code == 200


def test_login():
    response = client.post("/login", json=user)
    assert response.status_code == 200


def test_token():
    response = client.get("/protected")
    assert response.status_code == 403
    response = client.post("/login", json=user)
    assert response.status_code == 200
    token = response.json().get("token")
    assert token is not None
    headers = {"Authorization": "Bearer " + token}
    response = client.get("/protected", headers=headers)
    assert response.status_code == 200
