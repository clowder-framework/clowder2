import asyncio
import json
import logging

from aio_pika import connect_robust
from aio_pika.abc import AbstractIncomingMessage
from packaging import version

from app.config import settings
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
                new_extractor = await extractor_db.insert()
                # TODO - for now we are not deleting an older version of the extractor, just adding a new one
                # await existing_extractor.delete()
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
    connection = await connect_robust(
        url=settings.RABBITMQ_URL,
        login=settings.RABBITMQ_USER,
        password=settings.RABBITMQ_PASS,
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
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(listen_for_heartbeats())
