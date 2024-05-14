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
    response.raise_for_status()
    return response.json().get("id")


def upload_image(
    api: str,
    headers: dict,
    dataset_id: str,
    filename: str,
    content: bytes,
):
    """Uploads a dummy file (optionally with custom name/content) to a dataset and returns the JSON."""
    with open(filename, "wb") as tempf:
        tempf.write(content)
    file_data = {"file": open(filename, "rb")}
    response = requests.post(
        f"{api}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    os.remove(filename)
    return response.json().get("id")


def create_users(api: str):
    users = []
    for _ in range(5):
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


def upload_metadata_definition(api):
    metadata_definition = {
        "name": "LatLon",
        "description": "A set of Latitude/Longitude coordinates",
        "required_for_items": {"datasets": False, "files": False},
        "context": [
            {
                "longitude": "https://schema.org/longitude",
                "latitude": "https://schema.org/latitude",
            }
        ],
        "fields": [
            {
                "name": "longitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
            {
                "name": "latitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
        ],
    }
    requests.post(
        f"{api}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )


def upload_metadata_dataset(fake, api, dataset_id):
    metadata_definition = {
        "name": "LatLon",
        "description": "A set of Latitude/Longitude coordinates",
        "required_for_items": {"datasets": False, "files": False},
        "context": [
            {
                "longitude": "https://schema.org/longitude",
                "latitude": "https://schema.org/latitude",
            }
        ],
        "fields": [
            {
                "name": "longitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
            {
                "name": "latitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
        ],
    }
    response = requests.post(
        f"{api}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )

    # upload metadata
    metadata_using_definition = {
        "content": {
            "latitude": str(fake.latitude()),
            "longitude": str(fake.longitude()),
        },
        "definition": "LatLon",
    }
    response = requests.post(
        f"{api}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    code = str(response.status_code)
    print(f"Metadata uploaded: {metadata_using_definition} | {code}")


def upload_metadata_file(fake, api, file_id):
    metadata_definition = {
        "name": "LatLon",
        "description": "A set of Latitude/Longitude coordinates",
        "required_for_items": {"datasets": False, "files": False},
        "context": [
            {
                "longitude": "https://schema.org/longitude",
                "latitude": "https://schema.org/latitude",
            }
        ],
        "fields": [
            {
                "name": "longitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
            {
                "name": "latitude",
                "list": False,
                "widgetType": "TextField",
                "config": {"type": "float"},
                "required": True,
            },
        ],
    }
    response = requests.post(
        f"{api}/metadata/definition",
        json=metadata_definition,
        headers=headers,
    )

    # upload metadata
    metadata_using_definition = {
        "content": {
            "latitude": str(fake.latitude()),
            "longitude": str(fake.longitude()),
        },
        "definition": "LatLon",
    }
    response = requests.post(
        f"{api}/files/{file_id}/metadata",
        headers=headers,
        json=metadata_using_definition,
    )
    code = str(response.status_code)
    print(f"Metadata uploaded: {metadata_using_definition} | {code}")


if __name__ == "__main__":
    # command line args
    args = sys.argv[1:]
    api: str = args[
        0
    ]  # dev: http://localhost:8000/api/v2 prod: http://localhost/api/v2

    fake = Faker()
    users = create_users(api)

    for _ in range(0, 100):
        n = random.randint(0, 4)
        s = random.randint(0, 3)
        user = users[n]
        response = requests.post(f"{api}/login", json=user)
        token = response.json().get("token")
        headers = {"Authorization": "Bearer " + token}
        license_id = "CC BY"
        if s == 0:
            dataset_data = {
                "name": fake.sentence(nb_words=10).rstrip("."),
                "description": fake.paragraph(),
                "status": "PUBLIC",
            }
        elif s == 1:
            dataset_data = {
                "name": fake.sentence(nb_words=10).rstrip("."),
                "description": fake.paragraph(),
                "status": "AUTHENTICATED",
            }
        else:
            dataset_data = {
                "name": fake.sentence(nb_words=10).rstrip("."),
                "description": fake.paragraph(),
            }
        response = requests.post(
            f"{api}/datasets?license_id={license_id}",
            json=dataset_data,
            headers=headers,
        )
        if response.status_code != 200:
            raise ValueError(response.json())
        dataset_id = response.json().get("id")
        print(f"Dataset created: {dataset_id}")

        # add user to list of users who have access to dataset
        first_user_email = users[0].get("email")
        first_user_password = users[0].get("password")
        response = requests.post(
            f"{api}/authorizations/datasets/{dataset_id}/user_role/{first_user_email}/owner",
            json=dataset_data,
            headers=headers,
        )
        response.raise_for_status()
        print(
            f"Added first user as owner of dataset {dataset_id}. User email: {first_user_email} User password: {first_user_password}"
        )

        for _ in range(0, 1):
            filename = fake.file_name(extension="csv")
            filebytes = fake.csv()
            file_id = upload_file(api, headers, dataset_id, filename, filebytes)
            print(f"Uploaded file {filename} to dataset {dataset_id}")
            upload_metadata_file(fake, api, file_id)

        for _ in range(0, 1):
            filename = fake.file_name(extension="png")
            filebytes = fake.image()
            file_id = upload_image(api, headers, dataset_id, filename, filebytes)
            print(f"Uploaded file {filename} to dataset {dataset_id}")
            upload_metadata_file(fake, api, file_id)

        for _ in range(0, 1):
            filename = fake.file_name(extension="json")
            filebytes = fake.json()
            file_id = upload_file(api, headers, dataset_id, filename, filebytes)
            print(f"Uploaded file {filename} to dataset {dataset_id}")
            upload_metadata_file(fake, api, file_id)

        upload_metadata_definition(api)
        upload_metadata_dataset(fake, api, dataset_id)
