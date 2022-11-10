import json
import pika
from fastapi import Request, HTTPException, Depends
from pymongo import MongoClient
from bson import ObjectId
from pika.adapters.blocking_connection import BlockingChannel

from app.keycloak_auth import get_token
from app import dependencies
from app.models.files import FileOut
from app.models.datasets import DatasetOut
from app.models.listeners import EventListenerMessage


def submit_file_message(
    file_out: FileOut,
    queue: str,
    routing_key: str,
    parameters: dict,
    token: str = Depends(get_token),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    # TODO check if extractor is registered
    current_filename = file_out.name
    current_fileSize = file_out.bytes
    current_id = file_out.id
    current_datasetId = file_out.dataset_id
    current_secretKey = token
    print(current_secretKey)
    print(type(current_secretKey))
    try:
        msg_body = EventListenerMessage(
            filename=file_out.name,
            fileSize=file_out.bytes,
            id=str(current_id),
            datasetId=str(current_datasetId),
            secretKey=current_secretKey,
        )
    except Exception as e:
        print(e)

    rabbitmq_client.queue_bind(
        exchange="extractors",
        queue=queue,
        routing_key=routing_key,
    )
    rabbitmq_client.basic_publish(
        exchange="extractors",
        routing_key=routing_key,
        body=json.dumps(msg_body.dict(), ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type="application/json", delivery_mode=1
        ),
    )
    return {"message": "testing", "file_id": file_out.id}


def submit_dataset_message(
    dataset_out: DatasetOut,
    queue: str,
    routing_key: str,
    parameters: dict,
    token: str = Depends(get_token),
    db: MongoClient = Depends(dependencies.get_db),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
):
    # TODO check if extractor is registered
    msg_body = EventListenerMessage(
        filename=dataset_out.name,
        fileSize=dataset_out.bytes,
        id=dataset_out.id,
        datasetId=dataset_out.dataset_id,
        secretKey=token,
    )

    rabbitmq_client.queue_bind(
        exchange="extractors",
        queue=queue,
        routing_key=routing_key,
    )
    rabbitmq_client.basic_publish(
        exchange="extractors",
        routing_key=routing_key,
        body=json.dumps(msg_body.dict(), ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type="application/json", delivery_mode=1
        ),
    )
    return {"message": "testing", "dataset_id": dataset_out.id}
