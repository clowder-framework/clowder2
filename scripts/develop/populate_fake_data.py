"""Creates a fake users and data in an existing instance of clowder2.

To run pass in API URL of running instance. The first user it creates will have access to all datasets created.

`python populate_fake_data.py http://localhost:8000/api/v2`
"""
import os
import random
import sys

import requests
from faker import Faker


def upload_file(
        api: str,
        headers: dict,
        dataset_id: str,
        filename: str,
        content: str,
):
    """Uploads a dummy file (optionally with custom name/content) to a dataset and returns the JSON."""
    with open(filename, "w") as tempf:
        tempf.write(content)
    file_data = {"file": open(filename, "rb")}
    response = requests.post(
        f"{api}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(filename)
    assert response.status_code == 200
    assert response.json().get("id") is not None
    return response.json()


def create_users(api: str):
    users = []
    for x in range(10):
        user = {
            "email": fake.ascii_email(),
            "password": fake.password(20),
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
        }
        response = requests.post(f"{api}/users", json=user)
        if response.status_code != 200:
            raise ValueError(response.json())
        users.append(user)
        print(f"User created: {user}")
    return users


if __name__ == '__main__':
    # command line args
    args = sys.argv[1:]
    api: str = args[0]  # dev: http://localhost:8000/api/v2 prod: http://localhost/api/v2

    fake = Faker()
    users = create_users(api)

    for x in range(0, 100):
        n = random.randint(0, 9)
        user = users[n]
        response = requests.post(f"{api}/login", json=user)
        token = response.json().get("token")
        headers = {"Authorization": "Bearer " + token}
        dataset_data = {
            "name": fake.sentence(),
            "description": fake.paragraph(),
        }
        response = requests.post(
            f"{api}/datasets", json=dataset_data, headers=headers
        )
        if response.status_code != 200:
            raise ValueError(response.json())
        dataset_id = response.json().get("id")
        print(f"Dataset created: {dataset_id}")

        # add user to list of users who have access to dataset
        first_user_email = users[0].get("email")
        first_user_password = users[0].get("password")
        response = requests.post(
            f"{api}/authorizations/datasets/{dataset_id}/user_role/{first_user_email}/owner", json=dataset_data,
            headers=headers
        )
        response.raise_for_status()
        print(
            f"Added first user as owner of dataset {dataset_id}. User email: {first_user_email} User password: {first_user_password}")

        for x in range(0, 10):
            filename = fake.file_name(extension="csv")
            filebytes = fake.csv()
            upload_file(api, headers, dataset_id, filename, filebytes)
            print(f"Uploaded file {filename} to dataset {dataset_id}")
