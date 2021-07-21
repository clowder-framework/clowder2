# Clowder FastAPI Example

Run app:
```bash
# Configure the location of your MongoDB database:
export MONGODB_URL="mongodb://localhost:27017"

uvicorn app.main:app --reload
```

Run mongo:
__
`docker run --name clowder-mongo-fastapi -p 27017:27017 -d mongo`

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

