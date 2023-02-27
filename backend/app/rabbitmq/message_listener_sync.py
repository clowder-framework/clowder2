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
from app.models.listeners import (
    EventListenerJob,
    EventListenerJobUpdate,
    EventListenerJobStatus
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_message_status(msg):
    """Determine if the message corresponds to start/middle/end of job if possible. See pyclowder.utils.StatusMessage."""
    if msg.startswith("StatusMessage.start: ") or msg.startswith("STARTED: "):
        return {
            "status": EventListenerJobStatus.STARTED,
            "cleaned_msg": msg.replace("StatusMessage.start: ", "").replace("STARTED: ", "")
        }
    elif msg.startswith("StatusMessage.done: ") or msg.startswith("SUCCEEDED: "):
        return {
            "status": EventListenerJobStatus.SUCCEEDED,
            "cleaned_msg": msg.replace("StatusMessage.done: ", "").replace("SUCCEEDED: ", "")
        }
    elif msg.startswith("StatusMessage.error: ") or msg.startswith("ERROR: "):
        return {
            "status": EventListenerJobStatus.ERROR,
            "cleaned_msg": msg.replace("StatusMessage.error: ", "").replace("ERROR: ", "")
        }
    elif msg.startswith("StatusMessage.retry: ") or msg.startswith("RESUBMITTED: "):
        return {
            "status": EventListenerJobStatus.RESUBMITTED,
            "cleaned_msg": msg.replace("StatusMessage.retry: ", "").replace("RESUBMITTED: ", "")
        }
    elif msg.startswith("StatusMessage.skip: ") or msg.startswith("SKIPPED: "):
        return {
            "status": EventListenerJobStatus.SKIPPED,
            "cleaned_msg": msg.replace("StatusMessage.skip: ", "").replace("SKIPPED: ", "")
        }
    elif msg.startswith("StatusMessage.processing: ") or msg.startswith("PROCESSING: "):
        # If the message is a simple status update, we can keep status as STARTED.
        return {
            "status": EventListenerJobStatus.PROCESSING,
            "cleaned_msg": msg.replace("StatusMessage.processing: ", "").replace("PROCESSING: ", "")
        }
    else:
        # TODO: Should we default to something else here?
        return EventListenerJobStatus.PROCESSING
        return {
            "status": EventListenerJobStatus.PROCESSING,
            "cleaned_msg": msg
        }


def callback(ch, method, properties, body):
    """This method receives messages from RabbitMQ and processes them."""
    msg = json.loads(body.decode("utf-8"))

    job_id = msg["job_id"]
    message_str = msg["status"]
    timestamp = datetime.strptime(
        msg["start"], "%Y-%m-%dT%H:%M:%S%z"
    )  # incoming format: '2023-01-20T08:30:27-05:00'
    timestamp = timestamp.replace(tzinfo=datetime.utcnow().tzinfo)

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]

    # TODO: Updating an event message could go in rabbitmq/listeners

    # Check if the job exists, and update if so
    existing_job = db["listener_jobs"].find_one({"_id": ObjectId(job_id)})
    if existing_job is not None:
        # Update existing job with newest info
        updated_job = EventListenerJob.from_mongo(existing_job)
        updated_job.updated = timestamp
        parsed = parse_message_status(message_str)
        status = parsed["status"]
        cleaned_msg = parsed["cleaned_msg"]

        # Update the job timestamps/duration depending on what status we received
        update_duration = False
        if status == EventListenerJobStatus.STARTED and updated_job.started is None:
            updated_job.started = timestamp
        elif status == EventListenerJobStatus.SUCCEEDED \
                or status == EventListenerJobStatus.ERROR \
                or status == EventListenerJobStatus.SKIPPED:
            updated_job.finished = timestamp
            update_duration = True
        elif status == EventListenerJobStatus.PROCESSING or status == EventListenerJobStatus.RESUBMITTED:
            updated_job.updated = timestamp
            update_duration = True
        if update_duration and updated_job.started:
            updated_job.duration = (timestamp - updated_job.started).total_seconds()
        updated_job.status = status
        updated_job.latest_message = cleaned_msg
        db["listener_jobs"].replace_one(
            {"_id": ObjectId(job_id)}, updated_job.to_mongo()
        )

        # Add latest message to the job updates
        event_msg = EventListenerJobUpdate(
            job_id=job_id, status=cleaned_msg, timestamp=timestamp
        )
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
        instance_id = "".join(
            random.choice(
                string.ascii_uppercase + string.ascii_lowercase + string.digits
            )
            for _ in range(10)
        )
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        db["config"].insert_one(config_entry.to_mongo())

    channel.exchange_declare(exchange="clowder", durable=True)
    result = channel.queue_declare(
        queue="clowder.%s" % instance_id,
        durable=True,
        exclusive=False,
        auto_delete=False,
    )
    queue_name = result.method.queue
    channel.queue_bind(exchange="clowder", queue=queue_name)

    logger.info(f" [*] Listening to {queue_name}")
    logger.info(" [*] Waiting for messages. To exit press CTRL+C")
    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=False
    )
    channel.start_consuming()


if __name__ == "__main__":
    asyncio.run(listen_for_messages())
