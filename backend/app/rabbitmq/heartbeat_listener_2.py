import pika
import json
from app.config import settings
from pymongo import MongoClient
from app.models.extractors import (
    ExtractorBase,
    ExtractorIn,
    ExtractorDB,
    ExtractorOut,
)

def callback(ch, method, properties, body):
    statusBody = json.loads(body.decode("utf-8"))
    print("received extractor heartbeat: " + str(statusBody))
    extractor_id = statusBody['id']
    extractor_queue = statusBody['queue']
    extractor_info = statusBody['extractor_info']
    extractor_name = extractor_info['name']
    extractor_db = ExtractorDB(**extractor_info)
    client = MongoClient(settings.MONGODB_URL)
    db = client['clowder2']
    existing_extractor = db["extractors"].find_one({"name": extractor_queue})
    if existing_extractor is not None:
        existing_version = existing_extractor['version']
        new_version = float(extractor_info['version'])
        if new_version > existing_version:
            new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
            found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
            removed = db["extractors"].delete_one({"_id": existing_extractor['_id']})
            extractor_out = ExtractorOut.from_mongo(found)
            return extractor_out
    else:
        new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
        found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
        extractor_out = ExtractorOut.from_mongo(found)
        return extractor_out

def receive_logs():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.exchange_declare(exchange='extractors', exchange_type='fanout', durable=True)

    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange='extractors', queue=queue_name)

    print(' [*] Waiting for logs. To exit press CTRL+C')

    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()

if __name__ == "__main__":
    print('about to start')
    receive_logs()