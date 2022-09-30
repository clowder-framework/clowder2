import requests
from faker import Faker
import random

API_V2_STR: str = "http://localhost:8000/api/v2"
fake = Faker()

users = []
for x in range(10):
    user = {
        "email": fake.ascii_email(),
        "password": "not_a_password",
        "full_name": fake.name(),
    }
    response = requests.post(f"{API_V2_STR}/users", json=user)
    users.append(user)

for x in range(0, 10):
    n = random.randint(0, 9)
    user = users[n]
    response = requests.post(f"{API_V2_STR}/login", json=user)
    token = response.json().get("token")
    print(user)
    print(token)
    headers = {"Authorization": "Bearer " + token}

    dataset_data = {
        "name": fake.sentence(),
        "description": fake.paragraph(),
    }

    response = requests.post(
        f"{API_V2_STR}/datasets", json=dataset_data, headers=headers
    )

    print(response.json().get("id"))
