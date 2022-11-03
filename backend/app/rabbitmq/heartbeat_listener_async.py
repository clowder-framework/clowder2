import asyncio
import json
from packaging import version
from aio_pika import ExchangeType, connect
from app.config import settings
from aio_pika.abc import AbstractIncomingMessage
from pymongo import MongoClient
from app.models.listeners import LegacyEventListenerIn, EventListenerOut


async def on_message(message: AbstractIncomingMessage) -> None:
    async with message.process():
        statusBody = json.loads(message.body.decode("utf-8"))
        print("received extractor heartbeat: " + str(statusBody))
        extractor_id = statusBody["id"]
        extractor_queue = statusBody["queue"]
        extractor_info = statusBody["extractor_info"]
        extractor_name = extractor_info["name"]
        extractor_db = LegacyEventListenerIn(**extractor_info)
        client = MongoClient(settings.MONGODB_URL)
        db = client["clowder2"]
        existing_extractor = db["listeners"].find_one({"name": extractor_queue})
        if existing_extractor is not None:
            existing_version = existing_extractor["version"]
            new_version = extractor_db.version
            if version.parse(new_version) > version.parse(existing_version):
                new_extractor = db["listeners"].insert_one(extractor_db.to_mongo())
                found = db["listeners"].find_one({"_id": new_extractor.inserted_id})
                removed = db["listeners"].delete_one({"_id": existing_extractor["_id"]})
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
            new_extractor = db["listeners"].insert_one(extractor_db.to_mongo())
            found = db["listeners"].find_one({"_id": new_extractor.inserted_id})
            extractor_out = EventListenerOut.from_mongo(found)
            print("new extractor registered: " + extractor_name)
            return extractor_out


async def main() -> None:
    # Perform connection
    RABBITMQ_URL = settings.RABBITMQ_URL
    connection = await connect(RABBITMQ_URL)

    async with connection:
        # Creating a channel
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)

        logs_exchange = await channel.declare_exchange(
            "extractors",
            ExchangeType.FANOUT,
            durable=True,
        )

        # Declaring queue
        queue = await channel.declare_queue(exclusive=True)

        # Binding the queue to the exchange
        await queue.bind(logs_exchange)

        # Start listening the queue
        await queue.consume(on_message)

        print(" [*] Heartbeat extractor, waiting for extractors.")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
