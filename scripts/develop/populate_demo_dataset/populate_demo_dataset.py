import os
import random
import sys
import json
import time

import requests
from faker import Faker

from app.keycloak_auth import get_current_user
from scripts.develop.populate_fake_data.populate_fake_data import upload_file

metadata = {
    "content": {"Author": "Banda, Juan M. and Tekumalla, Ramya and Wang, Guanyu and Yu, Jingyuan and Liu, Tuo and Ding, Yuning and Artemova, Katya and Tutubalinа, Elena and Chowell, Gerardo",
                "Created date": time.time(),
                "Publisher": "Zenodo",
                "Version": "145",
                "doi": "10.5281/zenodo.3723939",
                "url": "https://doi.org/10.5281/zenodo.3723939",
                "Note": "This dataset will be updated bi-weekly at least with additional tweets, look at the github repo for these updates. Release: We have standardized the name of the resource to match our pre-print manuscript and to not have to update it every week."},
    "definition": "Owner details",
}

def create_users(api: str):
    users = []
    for _ in range(1):
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

if __name__ == "__main__":
    # command line args
    args = sys.argv[1:]
    api: str = args[
        0
    ]  # dev: http://localhost:8000/api/v2 prod: http://localhost/api/v2
    #api = "http://localhost:8000/api/v2"
    user_email: str = args[1] # your email address to view the dataset

    fake = Faker()
    users = create_users(api)
    user = users[0]
    response = requests.post(f"{api}/login", json=user)
    token = response.json().get("token")
    headers = {"Authorization": "Bearer " + token}
    dataset_data = {
        "name": "A Twitter Dataset of 40+ million tweets related to COVID-19 (2)",
        "description": "Due to the relevance of the COVID-19 global pandemic, we are releasing our dataset of tweets acquired from the Twitter Stream related to COVID-19 chatter. The first 9 weeks of data (from January 1st, 2020 to March 11th, 2020) contain very low tweet counts as we filtered other data we were collecting for other research purposes, however, one can see the dramatic increase as the awareness for the virus spread. Dedicated data gathering started from March 11th to March 22nd which yielded over 4 million tweets a day. The data collected from the stream captures all languages, but the higher prevalence are: English, Spanish, and French. We release all tweets and retweets on the full_dataset.tsv file (40,823,816 unique tweets), and a cleaned version with no retweets on the full_dataset-clean.tsv file (7,479,940 unique tweets). There are several practical reasons for us to leave the retweets, tracing important tweets and their dissemination is one of them. For NLP tasks we provide the top 1000 frequent terms in frequent_terms.csv, the top 1000 bigrams in frequent_bigrams.csv, and the top 1000 trigrams in frequent_trigrams.csv. Some general statistics per day are included for both datasets in the statistics-full_dataset.tsv and statistics-full_dataset-clean.tsv files. More details can be found (and will be updated faster at: https://github.com/thepanacealab/covid19_twitter) As always, the tweets distributed here are only tweet identifiers (with date and time added) due to the terms and conditions of Twitter to re-distribute Twitter data. The need to be hydrated to be used",
    }
    response = requests.post(f"{api}/datasets", json=dataset_data, headers=headers)
    if response.status_code != 200:
        raise ValueError(response.json())
    dataset_id = response.json().get("id")
    print(f"Dataset created: {dataset_id}")

    # adding myself to view the dataset
    #user_email = "ddey2@illinois.edu" # put your user email to view the dataset
    response = requests.post(
        f"{api}/authorizations/datasets/{dataset_id}/user_role/{user_email}/owner",
        json=dataset_data,
        headers=headers,
    )
    response.raise_for_status()

    # adding metadata definition
    with open(os.path.join(os.getcwd(), 'owner_details.json')) as metadata_definition:
        json_definition = json.load(metadata_definition)
        response = requests.post(
            f"{api}/metadata/definition",
            json=json_definition,
            headers=headers,
        )
        response.raise_for_status()

    # add metadata to dataset using new definition
    response = requests.post(
        f"{api}/datasets/{dataset_id}/metadata",
        headers=headers,
        json=metadata
    )
    response.raise_for_status()

    # adding files
    file_path = os.path.join(os.getcwd(), 'statistics-full_dataset.tsv')
    file_data = {"file": open(file_path, "rb")}
    response = requests.post(
        f"{api}/datasets/{dataset_id}/files",
        headers=headers,
        files=file_data,
    )
    response.raise_for_status()
    print(response.json().get("id"))

