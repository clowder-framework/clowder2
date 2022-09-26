import requests
from faker import Faker
import random

API_V2_STR: str = "http://localhost:8000/api/v2" # for production use http://localhost/api/v2
fake = Faker()

users = []
for x in range(10):
    user = {
        "email": fake.ascii_email(),
        "password": "not_a_password",
        "first_name": fake.first_name(),
        "last_name": fake.last_name()
    }
    response = requests.post(f"{API_V2_STR}/users", json=user)
    users.append(user)
    print(f"User created: {user}")

for x in range(0, 100):
    n = random.randint(0, 9)
    user = users[n]
    response = requests.post(f"{API_V2_STR}/login", json=user)
    token = response.json().get("token")
    headers = {"Authorization": "Bearer " + token}
    dataset_data = {
        "name": fake.sentence(),
        "description": fake.paragraph(),
    }
    response = requests.post(
        f"{API_V2_STR}/datasets", json=dataset_data, headers=headers
    )
    dataset_id = response.json().get("id")
    print(f"Dataset created: {dataset_id}")
