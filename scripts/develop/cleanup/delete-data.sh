#!/bin/sh

# Delete data from mongo
mongo clowder2 < mongo-delete.js
# mongo clowder2 --eval "db.dropDatabase()

# Delete data from elasticsearch
curl -X DELETE http://localhost:9200/dataset
curl -X DELETE http://localhost:9200/file
curl -X DELETE http://localhost:9200/metadata