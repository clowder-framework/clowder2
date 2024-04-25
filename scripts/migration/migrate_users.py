import os
from faker import Faker
from dotenv import dotenv_values, load_dotenv
import requests
import asyncio
from pymongo import MongoClient
from app.config import settings
from itsdangerous.url_safe import URLSafeSerializer
from secrets import token_urlsafe
from app.routers.files import add_file_entry
from app.models.files import (
    FileOut,
    FileDB,
    FileDBViewList,
    LocalFileIn,
    StorageType,
)
from app.models.users import UserDB, UserOut, UserAPIKeyDB
from beanie import init_beanie
from fastapi import FastAPI, APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()
@app.on_event("startup")
async def start_db():
    client = AsyncIOMotorClient(str(settings.MONGODB_URL))
    await init_beanie(
        database=getattr(client, settings.MONGO_DATABASE),
        # Make sure to include all models. If one depends on another that is not in the list it is not clear which one is missing.
        document_models=[
            FileDB,
            FileDBViewList,
            UserDB,
            UserAPIKeyDB,
        ],
        recreate_views=True,
    )


asyncio.run(start_db())
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
    serializer = URLSafeSerializer(settings.local_auth_secret, salt="api_key")
    unique_key = token_urlsafe(16)
    hashed_key = serializer.dumps({"user": user, "key": unique_key})
    user_key = UserAPIKeyDB(user=user, key=unique_key, name='migrationKey')
    return user_key.key

def get_clowder_v1_users():
    endpoint = CLOWDER_V1 + 'api/users'
    r = requests.get(endpoint,  headers=base_headers_v1, verify=False)
    return r.json()

def get_clowder_v2_users():
    endpoint = CLOWDER_V2 + 'api/v2/users'
    r = requests.get(endpoint, headers=base_headers_v1, verify=False)
    return r.json()

async def create_v2_dataset(headers, dataset, user_email):
    print(dataset)
    dataset_name = dataset['name']
    dataset_description = dataset['description']
    dataset_endpoint = CLOWDER_V1 + 'api/datasets/' + dataset['id']
    r = requests.get(dataset_endpoint, headers=base_headers_v1, verify=False)
    dataset_files_endpoint = CLOWDER_V1 + 'api/datasets/' + dataset['id'] + '/files'
    r_files = requests.get(dataset_files_endpoint, headers=base_headers_v1, verify=False)
    dataset_in_v2_endpoint = CLOWDER_V2 + 'api/v2/datasets'
    # create dataset
    dataset_example = {
        "name": dataset_name,
        "description": dataset_description,
    }
    response = requests.post(
        dataset_in_v2_endpoint, headers=headers, json=dataset_example
    )
    files_result = r_files.json()
    if (user := await UserDB.find_one(UserDB.email == user_email)) is not None:
        print('we got a user!')
    for file in files_result:
        new_file = FileDB(
            name=file['filename'],
            creator=user,
            dataset_id=dataset.id,
        )
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

def create_local_user(user_v1):
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
    # response = requests.post(f"{CLOWDER_V2}api/v2/users", json=user_json)
    email_user_new_login(email)
    api_key = generate_user_api_key(email)
    print("Local user created and api key generated")
    if os.path.exists(output_file):
        print('it exists.')
    else:
        f = open(output_file, "x")
    with open(output_file, 'a') as f:
        entry = email + ',' + password + ',' + api_key + "\n"
        f.write(entry)
    return api_key

async def process_users():
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
                # TODO check if there is already a local user
                # user_v2_api_key = create_local_user(user_v1)
                user_v2_api_key = 'aZM2QXJ_lvw_5FKNUB89Vg'
                user_base_headers_v2 = {'X-API-key': user_v2_api_key}
                user_headers_v2 = {**user_base_headers_v2, 'Content-type': 'application/json',
                                      'accept': 'application/json'}
                for dataset in user_v1_datasets:
                    print('creating a dataset in v2')
                    dataset_id = await create_v2_dataset(user_headers_v2, dataset, email)
                    dataset_files_endpoint = CLOWDER_V1 + 'api/datasets/' + dataset['id'] + '/files'
                    r_files = requests.get(dataset_files_endpoint, headers=base_headers_v1, verify=False)
                    r_files_json = r_files.json()
                    print('here')

        else:
            print("not a local account")

asyncio.run(process_users())


