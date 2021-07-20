# Clowder FastAPI Example

Run app:
```bash
# Configure the location of your MongoDB database:
export MONGODB_URL="mongodb://localhost:27017"

uvicorn main:app --reload
```

Run mongo:
__
`docker run --name clowder-mongo-fastapi -p 27017:27017 -d mongo`

Mongo ObjectId
https://github.com/tiangolo/fastapi/issues/1515

ODM
https://github.com/art049/odmantic/
