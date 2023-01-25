import logging
import pika
import json
import asyncio
import random
import string
from datetime import datetime
from packaging import version
from pymongo import MongoClient
from bson import ObjectId

from app.config import settings
from app.models.config import ConfigEntryDB, ConfigEntryOut
from app.models.listeners import EventListenerDB, EventListenerOut, ExtractorInfo, \
    EventListenerJob, EventListenerJobUpdate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def callback(ch, method, properties, body):
    """This method receives messages from RabbitMQ and processes them."""
    msg = json.loads(body.decode("utf-8"))

    job_id = msg["job_id"]
    status = msg["status"]
    timestamp = datetime.strptime(msg["start"], '%Y-%m-%dT%H:%M:%S%z')  # incoming format: '2023-01-20T08:30:27-05:00'

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]

    # TODO: Updating an event message could go in rabbitmq/listeners

    # Check if the job exists, and update if so
    existing_job = db["listener_jobs"].find_one({"_id": ObjectId(job_id)})
    if existing_job is not None:
        # Update existing job with newest info
        updated_job = EventListenerJob.from_mongo(existing_job)
        updated_job.latest_message = status
        updated_job.updated = timestamp
        if updated_job.started is not None:
            updated_job.duration = timestamp - updated_job.started
        # TODO: How to handle "status" (completed/failed) with v1's "status" (the actual message)? Should interpret STARTED etc.
        updated_job.status = status
        db["listener_jobs"].replace_one(
            {"_id": ObjectId(job_id)}, updated_job.to_mongo()
        )

        # Add latest message to the job updates
        event_msg = EventListenerJobUpdate(job_id=job_id, status=status, timestamp=timestamp)
        db["listener_job_updates"].insert_one(event_msg.to_mongo())
        return True
    else:
        # We don't know what this job is. Reject the message.
        logger.error("Job ID %s not found in database, skipping message." % job_id)
        return False


async def listen_for_messages():
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, 5672, "/", credentials
    )
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]
    if (instance_id := db["config"].find_one({"key": "instance_id"})) is not None:
        instance_id = ConfigEntryOut.from_mongo(instance_id).value
    else:
        # If no ID has been generated for this instance, generate a 10-digit alphanumeric identifier
        instance_id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(10))
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        await db["config"].insert_one(config_entry.to_mongo())

    channel.exchange_declare(
        exchange="clowder", durable=True
    )
    result = channel.queue_declare(queue="clowder.%s" % instance_id, durable=True, exclusive=False, auto_delete=False)
    queue_name = result.method.queue
    channel.queue_bind(exchange="clowder", queue=queue_name)

    logger.info(" [*] Waiting for messages. To exit press CTRL+C")
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=False)
    channel.start_consuming()


if __name__ == "__main__":
    asyncio.run(listen_for_messages())
