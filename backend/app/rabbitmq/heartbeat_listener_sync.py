import pika
import json
from packaging import version
from app.config import settings
from pymongo import MongoClient
from app.models.listeners import (
    EventListenerDB,
    EventListenerOut,
)


def callback(ch, method, properties, body):
    statusBody = json.loads(body.decode("utf-8"))
    print("received extractor heartbeat: " + str(statusBody))
    extractor_id = statusBody["id"]
    extractor_queue = statusBody["queue"]
    extractor_info = statusBody["extractor_info"]
    extractor_name = extractor_info["name"]
    extractor_db = EventListenerDB(**extractor_info)
    client = MongoClient(settings.MONGODB_URL)
    db = client["clowder2"]
    existing_extractor = db["extractors"].find_one({"name": extractor_queue})
    if existing_extractor is not None:
        existing_version = existing_extractor["version"]
        new_version = extractor_db.version
        if version.parse(new_version) > version.parse(existing_version):
            new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
            found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
            removed = db["extractors"].delete_one({"_id": existing_extractor["_id"]})
            extractor_out = EventListenerOut.from_mongo(found)
            print(
                "extractor updated: "
                + extractor_name
                + ", old version: "
                + existing_version
                + ", new version: "
                + new_version
            )
            return extractor_out
    else:
        new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
        found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
        extractor_out = EventListenerOut.from_mongo(found)
        print("new extractor registered: " + extractor_name)
        return extractor_out


def listen_for_heartbeats():
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)

    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, 5672, "/", credentials
    )

    connection = pika.BlockingConnection(parameters)

    channel = connection.channel()

    channel.exchange_declare(
        exchange="extractors", exchange_type="fanout", durable=True
    )

    result = channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange="extractors", queue=queue_name)

    print(" [*] Waiting for heartbeats. To exit press CTRL+C")

    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()


if __name__ == "__main__":
    print("starting heartbeat listener")
    listen_for_heartbeats()
