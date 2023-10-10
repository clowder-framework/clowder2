#!/bin/sh

# Delete data from mongo
mongo clowder2 < mongo-delete.js
# mongo clowder2 --eval "db.dropDatabase()

# Delete data from elasticsearch
curl -X DELETE http://localhost:9200/clowder
curl -X DELETE http://localhost:9200/clowder-tests
