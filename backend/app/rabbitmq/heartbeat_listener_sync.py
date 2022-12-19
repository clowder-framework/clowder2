import logging
import pika
import json
from packaging import version
from pymongo import MongoClient

from app.config import settings
from app.models.listeners import EventListenerDB, EventListenerOut, ExtractorInfo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def callback(ch, method, properties, body):
    """This method receives messages from RabbitMQ and processes them."""
    msg = json.loads(body.decode("utf-8"))

    extractor_info = msg["extractor_info"]
    extractor_name = extractor_info["name"]
    extractor_db = EventListenerDB(
        **extractor_info, properties=ExtractorInfo(**extractor_info)
    )

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]

    # TODO: This block could go in app.rabbitmq.listeners register_listener and update_listener methods?
    existing_extractor = db["listeners"].find_one({"name": msg["queue"]})
    if existing_extractor is not None:
        # Update existing listener
        existing_version = existing_extractor["version"]
        new_version = extractor_db.version
        if version.parse(new_version) > version.parse(existing_version):
            # TODO: Should this delete old version, or just add new entry? If 1st one, why not update?
            new_extractor = db["listeners"].insert_one(extractor_db.to_mongo())
            found = db["listeners"].find_one({"_id": new_extractor.inserted_id})
            removed = db["listeners"].delete_one({"_id": existing_extractor["_id"]})
            extractor_out = EventListenerOut.from_mongo(found)
            logger.info(
                "%s updated from %s to %s"
                % (extractor_name, existing_version, new_version)
            )
            return extractor_out
    else:
        # Register new listener
        new_extractor = db["listeners"].insert_one(extractor_db.to_mongo())
        found = db["listeners"].find_one({"_id": new_extractor.inserted_id})
        extractor_out = EventListenerOut.from_mongo(found)
        logger.info("New extractor registered: " + extractor_name)
        return extractor_out


def listen_for_heartbeats():
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, 5672, "/", credentials
    )
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    channel.exchange_declare(
        exchange=settings.HEARTBEAT_EXCHANGE, exchange_type="fanout", durable=True
    )
    result = channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange=settings.HEARTBEAT_EXCHANGE, queue=queue_name)

    logger.info(" [*] Waiting for heartbeats. To exit press CTRL+C")
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    channel.start_consuming()


if __name__ == "__main__":
    listen_for_heartbeats()
