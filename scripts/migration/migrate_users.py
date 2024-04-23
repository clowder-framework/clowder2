import os
from faker import Faker
from dotenv import dotenv_values, load_dotenv
import requests

fake = Faker()

path_to_env = os.path.join(os.getcwd(), 'scripts', 'migration', '.env')
print(os.path.isfile(path_to_env))
config = dotenv_values(dotenv_path=path_to_env)

CLOWDER_V1 = config["CLOWDER_V1"]
ADMIN_KEY_V1 = config["ADMIN_KEY_V1"]

CLOWDER_V2 = config["CLOWDER_V2"]
ADMIN_KEY_V2 = config["ADMIN_KEY_V2"]

base_headers_v1 = {'X-API-key': ADMIN_KEY_V1}
clowder_headers_v1 = {**base_headers_v1, 'Content-type': 'application/json',
        'accept': 'application/json'}

base_headers_v2 = {'X-API-key': ADMIN_KEY_V2}
clowder_headers_v2 = {**base_headers_v2, 'Content-type': 'application/json',
        'accept': 'application/json'}

def email_user_new_login(user):
    print("login to the new clowder instance")

def generate_user_api_key(user):
    print("Generate user api key")

def get_clowder_v1_users():
    endpoint = CLOWDER_V1 + 'api/users'
    r = requests.get(endpoint,  headers=base_headers_v1, verify=False)
    return r.json()

def create_local_user(local_user_v1):
    first_name = user_v1['firstName']
    last_name = user_v1['lastName']
    email = user_v1['email']
    # password = fake.password(20)
    password = 'Password123&'
    user_json = {
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name
    }
    response = requests.post(f"{CLOWDER_V2}api/v2/users", json=user_json)
    email_user_new_login(user_json)
    api_key = generate_user_api_key(user_json)
    print("Local user created and api key generated")
    return api_key

users_v1 = get_clowder_v1_users()


for user_v1 in users_v1:
    print(user_v1)
    email = user_v1['email']
    firstName = user_v1['firstName']
    lastName = user_v1['lastName']

    id_provider = user_v1['identityProvider']
    if '[Local Account]' in user_v1['identityProvider']:
        user_v2 = create_local_user(user_v1)
    else:
        print("not a local account")


