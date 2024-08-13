# Elasticsearch

For a brief introduction to Elasticsearch, please take a look [here https://www.elastic.co/guide/en/app-search/current/getting-started.html

For some examples in Python, please refer to https://www.elastic.co/guide/en/elasticsearch/client/python-api/master/examples.html

We are running Elasticsearch inside Docker at port 9200. Once the elasticsearch docker container is up and running,
you should be able to connect to http://localhost:9200 and see something like below:

![Connect to elasticsearch](../assets/images/elasticsearch1.png)

If you see error in Elasticsearch docker container and that is related to heap memory, try upgrading memory to
8Gb in docker setting.

For all the implemented elasticsearch APIs, please refer to the code in `backend/app/elasticsearch/connect.py`.

## Common Commands

* List indices: `http://localhost:9200/_cat/indices`
* Delete index: `curl -X DELETE http://localhost:9200/{index name}`
