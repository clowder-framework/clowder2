import json
import random
import string

import pika
from app import dependencies
from app.models.config import ConfigEntryDB
from app.models.datasets import DatasetOut
from app.models.files import FileOut
from app.models.listeners import (
    EventListenerDatasetJobMessage,
    EventListenerJobDB,
    EventListenerJobMessage,
)
from app.models.mongomodel import MongoDBRef
from app.models.users import UserOut
from app.routers.users import get_user_job_key
from fastapi import Depends
from pika.adapters.blocking_connection import BlockingChannel
import aio_pika
from aio_pika.abc import AbstractChannel


async def create_reply_queue(channel: AbstractChannel):
    if (config_entry := await ConfigEntryDB.find_one({"key": "instance_id"})) is not None:
        instance_id = config_entry.value
    else:
        instance_id = "".join(
            random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits)
            for _ in range(10)
        )
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        await config_entry.insert()

    queue_name = f"clowder.{instance_id}"

    # Use aio_pika methods instead of pika methods
    exchange = await channel.declare_exchange("clowder", durable=True)
    queue = await channel.declare_queue(queue_name, durable=True, exclusive=False, auto_delete=False)
    await queue.bind(exchange)

    return queue.name


async def submit_file_job(
    file_out: FileOut,
    routing_key: str,
    parameters: dict,
    user: UserOut,
    rabbitmq_client: AbstractChannel,
):
    print(f"DEBUG submit_file_job: Got client of type: {type(rabbitmq_client)}")
    # Create an entry in job history with unique ID
    job = EventListenerJobDB(
        listener_id=routing_key,
        creator=user,
        resource_ref=MongoDBRef(
            collection="files", resource_id=file_out.id, version=file_out.version_num
        ),
        parameters=parameters,
    )
    await job.insert()


    current_secretKey = await get_user_job_key(user.email)
    msg_body = EventListenerJobMessage(
        filename=file_out.name,
        fileSize=file_out.bytes,
        id=str(file_out.id),
        datasetId=str(file_out.dataset_id),
        secretKey=current_secretKey,
        job_id=str(job.id),
        parameters=parameters,
    )

    # Use aio_pika publishing
    # Get the existing clowder exchange
    reply_to = await create_reply_queue(rabbitmq_client)
    print("RABBITMQ_CLIENT: " + str(rabbitmq_client))
    await rabbitmq_client.default_exchange.publish(
        aio_pika.Message(
            body=json.dumps(msg_body.dict(), ensure_ascii=False).encode('utf-8'),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            reply_to=reply_to,
        ),
        routing_key=routing_key,
    )
    return str(job.id)


async def submit_dataset_job(
    dataset_out: DatasetOut,
    routing_key: str,
    parameters: dict,
    user: UserOut,
    rabbitmq_client: AbstractChannel,
):
    # Create an entry in job history with unique ID
    job = EventListenerJobDB(
        listener_id=routing_key,
        creator=user,
        resource_ref=MongoDBRef(collection="datasets", resource_id=dataset_out.id),
        parameters=parameters,
    )
    await job.insert()

    current_secretKey = await get_user_job_key(user.email)
    msg_body = EventListenerDatasetJobMessage(
        datasetName=dataset_out.name,
        id=str(dataset_out.id),
        datasetId=str(dataset_out.id),
        secretKey=current_secretKey,
        job_id=str(job.id),
        parameters=parameters,
    )
    reply_to = await create_reply_queue(rabbitmq_client)
    await rabbitmq_client.default_exchange.publish(
        aio_pika.Message(
            body=json.dumps(msg_body.dict(), ensure_ascii=False).encode('utf-8'),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            reply_to=reply_to,
        ),
        routing_key=routing_key,
    )
    return str(job.id)
