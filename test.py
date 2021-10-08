import requests
import json

test_username = "admin"
test_password = "test"

url = "http://127.0.0.1:8000/"

# THIS PART CREATES A USER

register_endpoint = 'users'

register_url = url + register_endpoint

data = {"name": test_username, "password": test_password}

r = requests.post(register_url, data=json.dumps(data), headers={'Content-type':'application.json'})

# THIS PART GETS A TOKEN FOR A USER

token_endpoint = 'login'

token_url = url + token_endpoint

r = requests.post(token_url, data=json.dumps(data), headers={'Content-type':'application.json'})

# THIS PART USES THE TOKEN TO ACCESS AN ENDPOINT

token = "thisisnotarealtoken"

protected_endpoint = 'protected'

protected_url = url + protected_endpoint

headers = {'Authorization': 'Bearer ' + token}

r = requests.get(protected_url, headers=headers)



