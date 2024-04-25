import os
from faker import Faker
from dotenv import dotenv_values, load_dotenv
import requests
from pymongo import MongoClient

output_file = 'new_users.txt'

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

TEST_DATASET_NAME = 'Migration Test Dataset'
# TODO this is just for testing
DEFAULT_PASSWORD = 'Password123&'
mongo_client = MongoClient("mongodb://localhost:27018", connect=False)
db = mongo_client["clowder"]
print('got the db')
v1_users = db["social.users"].find({})
for u in v1_users:
    print(u)
def email_user_new_login(user):
    print("login to the new clowder instance")

def generate_user_api_key(user):
    print("Generate user api key")

def get_clowder_v1_users():
    endpoint = CLOWDER_V1 + 'api/users'
    r = requests.get(endpoint,  headers=base_headers_v1, verify=False)
    return r.json()

def get_clowder_v2_users():
    endpoint = CLOWDER_V2 + 'api/v2/users'
    r = requests.get(endpoint, headers=base_headers_v1, verify=False)
    return r.json()

def create_v2_dataset(headers, dataset):
    print(dataset)
    dataset_endpoint = CLOWDER_V1 + 'api/datasets/' + dataset['id']
    r = requests.get(dataset_endpoint, headers=base_headers_v1, verify=False)
    dataset_result = r.json()
    dataset_files_endpoint = CLOWDER_V1 + 'api/datasets/' + dataset['id'] + '/files'
    r_files = requests.get(dataset_files_endpoint, headers=base_headers_v1, verify=False)
    files_result = r_files.json()
    print('here')


def get_clowder_v1_user_datasets(user_id):
    user_datasets = []
    endpoint = CLOWDER_V1 + 'api/datasets?limit=0'
    r = requests.get(endpoint, headers=base_headers_v1, verify=False)
    request_json = r.json()
    for dataset in request_json:
        if dataset['authorId'] == user_id:
            user_datasets.append(dataset)
    return user_datasets

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
    with open(output_file, 'a') as f:
        entry = email + ',' + password + ',' + api_key + "\n"
        f.write(entry)
    return api_key

users_v1 = get_clowder_v1_users()


for user_v1 in users_v1:
    print(user_v1)
    id = user_v1['id']
    email = user_v1['email']
    firstName = user_v1['firstName']
    lastName = user_v1['lastName']

    id_provider = user_v1['identityProvider']
    if '[Local Account]' in user_v1['identityProvider']:
        # get the v2 users
        if email != "a@a.com":
            user_v1_datasets = get_clowder_v1_user_datasets(user_id=id)
            # user_v2_api_key = create_local_user(user_v1)
            # user_base_headers_v2 = {'X-API-key': user_v2_api_key}
            # user_headers_v2 = {**user_base_headers_v2, 'Content-type': 'application/json',
            #                       'accept': 'application/json'}
            for dataset in user_v1_datasets:
                print('creating a dataset in v2')
                dataset_id = create_v2_dataset("user_headers_v2", dataset)


    else:
        print("not a local account")


