import asyncio
import json
from aio_pika import ExchangeType, connect
from app.config import settings
from aio_pika.abc import AbstractIncomingMessage
from pymongo import MongoClient
from app.models.extractors import (
    ExtractorBase,
    ExtractorIn,
    ExtractorDB,
    ExtractorOut,
)

async def on_message(message: AbstractIncomingMessage) -> None:
    async with message.process():
        statusBody = json.loads(message.body.decode("utf-8"))
        print("received extractor heartbeat: " + str(statusBody))
        extractor_id = statusBody['id']
        extractor_queue = statusBody['queue']
        extractor_info = statusBody['extractor_info']
        extractor_name = extractor_info['name']
        extractor_db = ExtractorDB(**extractor_info)
        client = MongoClient(settings.MONGODB_URL)
        db = client['clowder2']
        existing_extractor = db["extractors"].find_one({"name": extractor_queue})
        if existing_extractor is not None:
            existing_version = existing_extractor['version']
            if extractor_info['version'] > existing_version:
                new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
                found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
                removed = db["extractors"].delete_one({"_id":existing_extractor['_id']})
                extractor_out = ExtractorOut.from_mongo(found)
                return extractor_out
        else:
            new_extractor = db["extractors"].insert_one(extractor_db.to_mongo())
            found = db["extractors"].find_one({"_id": new_extractor.inserted_id})
            extractor_out = ExtractorOut.from_mongo(found)
            return extractor_out


async def main() -> None:
    # Perform connection
    connection = await connect("amqp://guest:guest@localhost/")

    async with connection:
        # Creating a channel
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)

        logs_exchange = await channel.declare_exchange(
            "extractors", ExchangeType.FANOUT,
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