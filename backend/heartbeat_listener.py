import asyncio
import json
import logging
import os
import time
from datetime import datetime

from aio_pika import connect_robust
from aio_pika.abc import AbstractIncomingMessage
from app.config import settings
from app.main import startup_beanie
from app.models.listeners import EventListenerDB, EventListenerOut, ExtractorInfo
from app.routers.listeners import _process_incoming_v1_extractor_info
from packaging import version

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

timeout = 5 * 60  # five minute timeout
time_ran = 0


async def callback(message: AbstractIncomingMessage):
    """This method receives messages from RabbitMQ and processes them.
    the extractor info is parsed from the message and if the extractor is new
    or is a later version, the db is updated.
    """
    async with message.process():
        msg = json.loads(message.body.decode("utf-8"))

        extractor_info = msg["extractor_info"]
        owner = msg["owner"]
        if owner is not None and owner != "":
            # Extractor name should match queue, which includes secret key with common extractor_info["name"]
            orig_properties = ExtractorInfo(**extractor_info)
            extractor_name = msg["queue"]
            del extractor_info["name"]
            extractor_db = EventListenerDB(
                **extractor_info,
                name=extractor_name,
                access={"owner": owner},
                properties=orig_properties,
            )
            logger.info(f"Received heartbeat from {extractor_name} owned by {owner}")
            existing_extractor = await EventListenerDB.find_one(
                EventListenerDB.name == extractor_name,
                EventListenerDB.access.owner == owner,
            )
        else:
            extractor_name = extractor_info["name"]
            extractor_db = EventListenerDB(
                **extractor_info,
                properties=ExtractorInfo(**extractor_info),
                access=None,
            )
            logger.info(f"Received heartbeat from {extractor_name}")
            existing_extractor = await EventListenerDB.find_one(
                EventListenerDB.name == extractor_name
            )

        # check to see if extractor already exists and update if so
        if existing_extractor is not None:
            extractor_db.id = existing_extractor.id
            extractor_db.created = existing_extractor.created
            extractor_db.active = existing_extractor.active

            # Update existing listener version
            existing_version = existing_extractor.version
            new_version = extractor_db.version
            if version.parse(new_version) > version.parse(existing_version):
                logger.info(
                    "%s updated from %s to %s"
                    % (extractor_name, existing_version, new_version)
                )

            # Update existing listeners alive status
            extractor_db.lastAlive = datetime.utcnow()
            extractor_db.alive = True
            logger.info("%s is alive at %s" % (extractor_name, str(datetime.utcnow())))
            new_extractor = await extractor_db.replace()
            extractor_out = EventListenerOut(**new_extractor.dict())

            return extractor_out

        else:
            # Register new listener
            extractor_db.lastAlive = datetime.utcnow()
            extractor_db.alive = True
            logger.info("%s is alive at %s" % (extractor_name, str(datetime.utcnow())))
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

        logger.info(f"[*] Listening to {exchange}")
        await queue.consume(
            callback=callback,
            no_ack=False,
        )

        logger.info("[*] Waiting for heartbeats. To exit press CTRL+C")
        try:
            # Wait until terminate
            await asyncio.Future()
        finally:
            await connection.close()


if __name__ == "__main__":
    start = datetime.now()
    while time_ran < timeout:
        try:
            asyncio.run(listen_for_heartbeats())
        except:  # noqa: E722
            logger.info("Heartbeat listener failed, retry in 10 seconds...")
            time.sleep(10)
            current_time = datetime.now()
            current_seconds = (current_time - start).total_seconds()
            time_ran += current_seconds
    logger.info("Heartbeat listener could not connect to rabbitmq.")
