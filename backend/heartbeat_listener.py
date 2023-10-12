import asyncio
import json
import logging
import os
from aio_pika import connect_robust
from aio_pika.abc import AbstractIncomingMessage
from packaging import version

from app.config import settings
from app.main import startup_beanie
from app.models.listeners import EventListenerDB, EventListenerOut, ExtractorInfo
from app.routers.listeners import _process_incoming_v1_extractor_info

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


async def callback(message: AbstractIncomingMessage):
    """This method receives messages from RabbitMQ and processes them.
    the extractor info is parsed from the message and if the extractor is new
    or is a later version, the db is updated.
    """
    async with message.process():
        msg = json.loads(message.body.decode("utf-8"))

        extractor_info = msg["extractor_info"]
        extractor_name = extractor_info["name"]
        extractor_db = EventListenerDB(
            **extractor_info, properties=ExtractorInfo(**extractor_info)
        )

        # check to see if extractor alredy exists and update if so
        existing_extractor = await EventListenerDB.find_one(
            EventListenerDB.name == msg["queue"]
        )
        if existing_extractor is not None:
            # Update existing listener
            existing_version = existing_extractor.version
            new_version = extractor_db.version
            if version.parse(new_version) > version.parse(existing_version):
                # if this is a new version, add it to the database
                extractor_db.id = existing_extractor.id
                extractor_db.created = existing_extractor.created
                new_extractor = await extractor_db.replace()
                extractor_out = EventListenerOut(**new_extractor.dict())
                logger.info(
                    "%s updated from %s to %s"
                    % (extractor_name, existing_version, new_version)
                )
                return extractor_out
        else:
            # Register new listener
            new_extractor = await extractor_db.insert()
            extractor_out = EventListenerOut(**new_extractor.dict())
            logger.info("New extractor registered: " + extractor_name)

            # Assign MIME-based listener if needed
            if extractor_out.properties and extractor_out.properties.process:
                await _process_incoming_v1_extractor_info(
                    extractor_name, extractor_out.id, extractor_out.properties.process
                )

            return extractor_out


async def listen_for_heartbeats():
    """
    this method runs continuously listening for extractor heartbeats sent over rabbitmq
    """
    await startup_beanie()

    # For some reason, Pydantic Settings environment variable overrides aren't being applied, so get them here.
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "127.0.0.1")
    RABBITMQ_URL: str = (
        "amqp://" + RABBITMQ_USER + ":" + RABBITMQ_PASS + "@" + RABBITMQ_HOST + "/"
    )

    connection = await connect_robust(
        url=RABBITMQ_URL,
        login=RABBITMQ_USER,
        password=RABBITMQ_PASS,
    )

    async with connection:
        # Prepare channel and queue if necessary
        channel = await connection.channel()
        exchange = await channel.declare_exchange(
            name=settings.HEARTBEAT_EXCHANGE, type="fanout", durable=True
        )
        queue = await channel.declare_queue(exclusive=True)
        await queue.bind(exchange)

        logger.info(f" [*] Listening to {exchange}")
        await queue.consume(
            callback=callback,
            no_ack=False,
        )

        logger.info(" [*] Waiting for heartbeats. To exit press CTRL+C")
        try:
            # Wait until terminate
            await asyncio.Future()
        finally:
            await connection.close()


if __name__ == "__main__":
    asyncio.run(listen_for_heartbeats())
