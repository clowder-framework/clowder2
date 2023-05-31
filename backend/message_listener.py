import asyncio
import json
import logging
import os
import random
import string
from datetime import datetime

from aio_pika import connect_robust
from aio_pika.abc import AbstractIncomingMessage
from bson import ObjectId

from app.config import settings
from app.main import startup_beanie
from app.models.config import ConfigEntryDB
from app.models.listeners import (
    EventListenerDB,
    EventListenerJobUpdateDB,
    EventListenerJobStatus,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


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


async def callback(message: AbstractIncomingMessage):
    """This method receives messages from RabbitMQ and processes them.
    the extractor info is parsed from the message and if the extractor is new
    or is a later version, the db is updated.
    """
    async with message.process():
        msg = json.loads(message.body.decode("utf-8"))

        job_id = msg["job_id"]
        message_str = msg["status"]
        timestamp = datetime.strptime(
            msg["start"], "%Y-%m-%dT%H:%M:%S%z"
        )  # incoming format: '2023-01-20T08:30:27-05:00'
        timestamp = timestamp.replace(tzinfo=datetime.utcnow().tzinfo)

        # TODO: Updating an event message could go in rabbitmq/listeners

        # Check if the job exists, and update if so
        job = await EventListenerDB.find_one(EventListenerDB.id == ObjectId(job_id))
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
    await startup_beanie()

    # For some reason, Pydantic Settings environment variable overrides aren't being applied, so get them here.
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_URL: str = (
        "amqp://" + RABBITMQ_USER + ":" + RABBITMQ_PASS + "@" + RABBITMQ_HOST + "/"
    )

    connection = await connect_robust(
        url=RABBITMQ_URL,
        login=RABBITMQ_USER,
        password=RABBITMQ_PASS,
    )

    async with connection:
        # Get or generate instance ID
        if (
            config_entry := await ConfigEntryDB.find_one({"key": "instance_id"})
        ) is not None:
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

        # Prepare channel and queue if necessary
        channel = await connection.channel()
        exchange = await channel.declare_exchange(name="clowder", durable=True)
        queue = await channel.declare_queue(
            name="clowder.%s" % instance_id,
            durable=True,
        )
        await queue.bind(exchange)

        logger.info(f" [*] Listening to {exchange}")
        await queue.consume(
            callback=callback,
            no_ack=False,
        )

        logger.info(" [*] Waiting for messages. To exit press CTRL+C")
        try:
            # Wait until terminate
            await asyncio.Future()
        finally:
            await connection.close()


if __name__ == "__main__":
    asyncio.run(listen_for_messages())
