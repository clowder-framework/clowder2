from elasticsearch import Elasticsearch


# To confirm if it can connect to elasticsearch serevr
def connect_elasticsearch():
    _es = None
    _es = Elasticsearch("http://localhost:9200")
    if _es.ping():
        print('Successfully connected to Elasticsearch')
    else:
        print('Can not connect to Elasticsearch')
    return _es


# Create index
def create_index(es_object, index_name):
    created = False
    # index settings
    settings = {
        "settings": {
            "number_of_shards": 3,
            "number_of_replicas": 3
        },
        "mappings": {
            "properties": {
                "name": {
                    "type": "text"
                },
                "created": {
                    "type": "date"
                },
                "creator": {
                    "type": "text"
                },
                "downloads": {
                    "type": "integer"
                }
            }
        }
    }

    doc = {
                "name": "text",
                "created": "date",
                "creator": "text",
                "downloads": "integer"
            }
    created = False
    try:
        if not es_object.indices.exists(index=index_name):
            # Ignore 400 means to ignore "Index Already Exist" error.
            es_object.indices.create(index=index_name, body=settings)
            #es_object.index(index=index_name, id=1, document=doc)
            print('Created Index')
            created = True
        else:
            print('Index already exists')
    except Elasticsearch.ElasticsearchException as ex:
        print(str(ex))
    finally:
        return created

# Insert a record
def insert_record(es_object, index_name, doc):
    try:
        es_object.index(index=index_name, document=doc)
    except Elasticsearch.ElasticsearchException as ex:
        print(str(ex))

# Search
def search_index(es_object, index_name, query):
    try:
        res = es_object.search(index=index_name, body=query)
        print("Got %d Hits:" % res['hits']['total']['value'])
        return res
    except Elasticsearch.ElasticsearchException as ex:
        print(str(ex))


# Delete an index
def delete_index(es_object, index_name):
    try:
        es_object.options(ignore_status=[400,404]).indices.delete(index=index_name)
    except Elasticsearch.ElasticsearchException as ex:
        print(str(ex))



# Create the client instance
#client = Elasticsearch("http://localhost:9200")

# Successful response!
#print("Response")
#print(client.info())
#es = connect_elasticsearch()
#create_index(es, "file")


