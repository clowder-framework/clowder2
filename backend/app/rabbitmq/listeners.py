import json
import pika
import string
import random
from fastapi import Request, HTTPException, Depends
from pymongo import MongoClient
from pika.adapters.blocking_connection import BlockingChannel

from app.config import settings
from app.keycloak_auth import get_token
from app import dependencies
from app.models.mongomodel import MongoDBRef
from app.models.config import ConfigEntryDB, ConfigEntryOut
from app.models.files import FileOut
from app.models.datasets import DatasetOut
from app.models.users import UserOut
from app.models.listeners import (
    EventListenerJob,
    EventListenerJobMessage,
    EventListenerDatasetJobMessage,
)


async def create_reply_queue():
    # TODO: Dependency injection not working here
    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]

    credentials = pika.PlainCredentials("guest", "guest")
    parameters = pika.ConnectionParameters("localhost", credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

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
        await db["config"].insert_one(config_entry.to_mongo())

    queue_name = "clowder.%s" % instance_id
    channel.exchange_declare(exchange="clowder", durable=True)
    result = channel.queue_declare(
        queue=queue_name, durable=True, exclusive=False, auto_delete=False
    )
    queue_name = result.method.queue
    channel.queue_bind(exchange="clowder", queue=queue_name)
    return queue_name


async def submit_file_job(
    file_out: FileOut,
    queue: str,
    routing_key: str,
    parameters: dict,
    user: UserOut,
    db: MongoClient,
    rabbitmq_client: BlockingChannel,
    token: str,
):
    # TODO check if extractor is registered

    # Create an entry in job history with unique ID
    job = EventListenerJob(
        listener_id=routing_key,
        creator=user,
        resource_ref=MongoDBRef(
            collection="file", resource_id=file_out.id, version=file_out.version_num
        ),
        parameters=parameters,
    )
    new_job = await db["listener_jobs"].insert_one(job.to_mongo())
    new_job_id = str(new_job.inserted_id)

    current_id = file_out.id
    current_datasetId = file_out.dataset_id
    current_secretKey = str(token)
    try:
        msg_body = EventListenerJobMessage(
            filename=file_out.name,
            fileSize=file_out.bytes,
            id=str(current_id),
            datasetId=str(current_datasetId),
            secretKey=current_secretKey,
            job_id=new_job_id,
        )
    except Exception as e:
        print(e)
        print(new_job_id)

    reply_to = await create_reply_queue()

    rabbitmq_client.basic_publish(
        exchange="",
        routing_key=routing_key,
        body=json.dumps(msg_body.dict(), ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type="application/json", delivery_mode=1, reply_to=reply_to
        ),
    )
    return {"message": "testing", "file_id": file_out.id}


async def submit_dataset_job(
    dataset_out: DatasetOut,
    queue: str,
    routing_key: str,
    parameters: dict,
    user: UserOut,
    token: str = Depends(get_token),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    # TODO check if extractor is registered

    # Create an entry in job history with unique ID
    job = EventListenerJob(
        listener_id=routing_key,
        creator=user,
        resource_ref=MongoDBRef(collection="dataset", resource_id=dataset_out.id),
        parameters=parameters,
    )
    new_job = await db["listener_jobs"].insert_one(job.to_mongo())
    new_job_id = str(new_job.inserted_id)

    msg_body = EventListenerDatasetJobMessage(
        datasetName=dataset_out.name,
        id=str(dataset_out.id),
        datasetId=str(dataset_out.id),
        secretKey=token,
        job_id=new_job_id,
    )

    reply_to = await create_reply_queue()

    rabbitmq_client.basic_publish(
        exchange="",
        routing_key=routing_key,
        body=json.dumps(msg_body.dict(), ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type="application/json", delivery_mode=1
        ),
        # reply_to=reply_to
    )
    return {"message": "testing", "dataset_id": dataset_out.id}
