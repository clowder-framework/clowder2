# Clowder FastAPI Example

## Try out
1. Run mongo: `docker run --name clowder-mongo-fastapi -p 27017:27017 -d mongo`

2. Install dependencies using [pipenv](https://github.com/pypa/pipenv).

3. Run app (or setup run configuration in pycharm):
    ```bash
    # Configure the location of your MongoDB database:
    export MONGODB_URL="mongodb://localhost:27017"
    
    uvicorn app.main:app --reload
    ```
   
Linting is managed using (Black)((https://black.readthedocs.io/en/stable/)). You can set up pycharm to automatically
run it when you save a file using these [instructions](https://black.readthedocs.io/en/stable/integrations/editors.html).
The repository includes an action to run Black on push and pull_request.

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

## Dev Environment Setup
1. To install Black python code formatter so it runs everytime you save in an IDE see https://black.readthedocs.io/en/stable/integrations/editors.html

## Docker

Build images with `docker compose -f docker-compose.yml build`

Run docker services with `docker compose up --scale backend=4`. This will start the services with four instances of the backend
running in parallel.

Default url for backend will be `http://clowder.docker.localhost/` using a web browser. If using a different client (for
example postman set the `HOST` header to `clowder.docker.localhost`).
This variable is set using the `traefik.http.routers.backend.rule` for the backend service.

To access the traefik dashboard go to `http://localhost:8080`. For the raw settings see `http://localhost:8080/api/rawdata`.

Minio console is available at `minioconsole.docker.localhost`.

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

