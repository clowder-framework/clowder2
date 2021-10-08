# Clowder FastAPI Example

## Try out
Run mongo: `docker run --name clowder-mongo-fastapi -p 27017:27017 -d mongo`

Run app:
```bash
# Configure the location of your MongoDB database:
export MONGODB_URL="mongodb://localhost:27017"

uvicorn app.main:app --reload
```

## NOTES ON ROUTES

1. Create a user with the POST /users endpoint in routes.users. Supply name and password
2. Get token using the POST /login endpoint in main. This will provide Bearer Access token good for 120 minutes.
3. Currently only the create dataset endpoint and the test /protected endpoing in main check for the token

## Mongo

There are currently a few different ways of connecting to Mongo shown in this project.

1. Datasets use MongoEngine and its `DynamicDocument`
2. Items use Motor directly and the custom `PyObjectId`
3. Users use Motor directly as well, but a `OID` and `MongoModel`. This means that the pydantic objects have less boilderplate.
4. `beanie_test.py` shows it the basic example from their documentation and it is not used in the routers yet.

# Notes

Mongo ObjectId
https://github.com/tiangolo/fastapi/issues/1515

ODM
https://github.com/art049/odmantic/

pymongo and fastapi
https://medium.com/fastapi-tutorials/integrating-fastapi-and-mongodb-8ef4f2ca68ad

mongoengine and fastapi
https://stackoverflow.com/questions/60277170/how-to-convert-mongoengine-class-in-pedantic-basemodel-in-python-fastapi

pydantic and objectid
https://stackoverflow.com/questions/59503461/how-to-parse-objectid-in-a-pydantic-model

mongoengine and fastapi
https://stackoverflow.com/questions/60277170/how-to-convert-mongoengine-class-in-pedantic-basemodel-in-python-fastapi

beanie odm
https://github.com/roman-right/beanie

