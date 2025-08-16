"""Upload metadata definitions from a local directory of JSON definitions.

`python upload_definitions.py http://localhost:8000/api/v2 {API_KEY} definitions`
"""

import json
import os
import sys

import requests

if __name__ == "__main__":
    # command line args
    args = sys.argv[1:]
    # instance url
    api: str = args[
        0
    ]  # dev: http://localhost:8000/api/v2 prod: http://localhost/api/v2
    # api key
    token: str = args[1]
    # directory with json metadata definitions
    dir: str = args[2]
    # header for POST request
    headers = {"X-API-KEY": token}
    # read definitions from local directory
    dir_list = os.listdir(dir)
    for file in dir_list:
        with open(os.path.join(dir, file)) as metadata_definition:
            json_definition = json.load(metadata_definition)
            response = requests.post(
                f"{api}/metadata/definition",
                json=json_definition,
                headers=headers,
            )
            response.raise_for_status()
    print(f"Uploaded {len(dir_list)} metadata definitions.")
