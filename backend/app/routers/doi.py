import os

import requests
from requests.auth import HTTPBasicAuth


class DataCiteClient:
    def __init__(self, test_mode=False):
        self.auth = HTTPBasicAuth(
            os.getenv("DATACITE_USERNAME"), os.getenv("DATACITE_PASSWORD")
        )
        self.headers = {"Content-Type": "application/vnd.api+json"}
        self.base_url = (
            "https://api.test.datacite.org/"
            if test_mode
            else "https://api.datacite.org/"
        )

    def create_doi(self, metadata):
        url = f"{self.base_url}dois"
        response = requests.post(
            url, auth=self.auth, headers=self.headers, json=metadata
        )
        return response.json()

    def get_all_dois(self):
        url = f"{self.base_url}dois"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        return response.json()

    def get_doi(self, doi):
        url = f"{self.base_url}dois/{doi}"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        return response.json()

    def update_doi(self, doi, metadata):
        url = f"{self.base_url}dois/{doi}"
        response = requests.put(
            url, auth=self.auth, headers=self.headers, json=metadata
        )
        return response.json()

    def delete_doi(self, doi):
        url = f"{self.base_url}dois/{doi}"
        response = requests.delete(url, auth=self.auth, headers=self.headers)
        return response.status_code == 204

    def get_doi_activity_status(self, doi):
        url = f"{self.base_url}events?doi={doi}"
        response = requests.get(url, auth=self.auth, headers=self.headers)
        return response.json()
