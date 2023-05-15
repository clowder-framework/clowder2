import asyncio
import json
import logging
import random
import string
from datetime import datetime

import pika
from bson import ObjectId
from pymongo import MongoClient

from app.config import settings
from app.models.config import ConfigEntryDB, ConfigEntryOut
from app.models.listeners import (
    EventListenerDB,
    EventListenerJobUpdateDB,
    EventListenerJobStatus,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_message_status(msg):
    """Determine if the message corresponds to start/middle/end of job if possible. See pyclowder.utils.StatusMessage."""
    if msg.startswith("StatusMessage.start: ") or msg.startswith("STARTED: "):
        return {
            "status": EventListenerJobStatus.STARTED,
            "cleaned_msg": msg.replace("StatusMessage.start: ", "").replace(
                "STARTED: ", ""
            ),
        }
    elif msg.startswith("StatusMessage.done: ") or msg.startswith("SUCCEEDED: "):
        return {
            "status": EventListenerJobStatus.SUCCEEDED,
            "cleaned_msg": msg.replace("StatusMessage.done: ", "").replace(
                "SUCCEEDED: ", ""
            ),
        }
    elif msg.startswith("StatusMessage.error: ") or msg.startswith("ERROR: "):
        return {
            "status": EventListenerJobStatus.ERROR,
            "cleaned_msg": msg.replace("StatusMessage.error: ", "").replace(
                "ERROR: ", ""
            ),
        }
    elif msg.startswith("StatusMessage.retry: ") or msg.startswith("RESUBMITTED: "):
        return {
            "status": EventListenerJobStatus.RESUBMITTED,
            "cleaned_msg": msg.replace("StatusMessage.retry: ", "").replace(
                "RESUBMITTED: ", ""
            ),
        }
    elif msg.startswith("StatusMessage.skip: ") or msg.startswith("SKIPPED: "):
        return {
            "status": EventListenerJobStatus.SKIPPED,
            "cleaned_msg": msg.replace("StatusMessage.skip: ", "").replace(
                "SKIPPED: ", ""
            ),
        }
    elif msg.startswith("StatusMessage.processing: ") or msg.startswith("PROCESSING: "):
        # If the message is a simple status update, we can keep status as STARTED.
        return {
            "status": EventListenerJobStatus.PROCESSING,
            "cleaned_msg": msg.replace("StatusMessage.processing: ", "").replace(
                "PROCESSING: ", ""
            ),
        }
    else:
        # TODO: Should we default to something else here?
        return EventListenerJobStatus.PROCESSING
        return {"status": EventListenerJobStatus.PROCESSING, "cleaned_msg": msg}


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
    job = EventListenerDB.find_one(EventListenerDB.id == ObjectId(job_id))
    if job:
        # Update existing job with newest info
        job.updated = timestamp
        parsed = parse_message_status(message_str)
        status = parsed["status"]
        cleaned_msg = parsed["cleaned_msg"]

        # Update the job timestamps/duration depending on what status we received
        update_duration = False
        if status == EventListenerJobStatus.STARTED and job.started is None:
            job.started = timestamp
        elif (
                status == EventListenerJobStatus.SUCCEEDED
                or status == EventListenerJobStatus.ERROR
                or status == EventListenerJobStatus.SKIPPED
        ):
            job.finished = timestamp
            update_duration = True
        elif (
                status == EventListenerJobStatus.PROCESSING
                or status == EventListenerJobStatus.RESUBMITTED
        ):
            job.updated = timestamp
            update_duration = True
        if update_duration and job.started:
            job.duration = (timestamp - job.started).total_seconds()
        job.status = status
        job.latest_message = cleaned_msg
        # TODO: works if synchronous?
        job.save()

        # Add latest message to the job updates
        event_msg = EventListenerJobUpdateDB(
            job_id=job_id, status=cleaned_msg, timestamp=timestamp
        )
        event_msg.save()
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
    if (config_entry := ConfigEntryOut.find_one({"key": "instance_id"})) is not None:
        instance_id = config_entry.value
    else:
        # If no ID has been generated for this instance, generate a 10-digit alphanumeric identifier
        instance_id = "".join(
            random.choice(
                string.ascii_uppercase + string.ascii_lowercase + string.digits
            )
            for _ in range(10)
        )
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        await config_entry.insert()

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
