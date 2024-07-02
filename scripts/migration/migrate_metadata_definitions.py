import os
from faker import Faker
from dotenv import dotenv_values, load_dotenv
import requests

fake = Faker()

path_to_env = os.path.join(os.getcwd(), "scripts", "migration", ".env")
print(os.path.isfile(path_to_env))
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]

CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

base_headers_v1 = {"X-API-key": ADMIN_KEY_V1}
clowder_headers_v1 = {
    **base_headers_v1,
    "Content-type": "application/json",
    "accept": "application/json",
}

base_headers_v2 = {"X-API-key": ADMIN_KEY_V2}
clowder_headers_v2 = {
    **base_headers_v2,
    "Content-type": "application/json",
    "accept": "application/json",
}


def get_clowder_v1_metadata_definitions():
    endpoint = CLOWDER_V1 + "api/metadata/definitions"
    r = requests.get(endpoint, headers=base_headers_v1, verify=False)
    return r.json()


md_definitions = get_clowder_v1_metadata_definitions()
print("got them")
