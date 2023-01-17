import json
import pika
from fastapi import Request, HTTPException, Depends
from pymongo import MongoClient
from pika.adapters.blocking_connection import BlockingChannel

from app.config import settings
from app.keycloak_auth import get_token
from app import dependencies
from app.models.mongomodel import MongoDBRef
from app.models.files import FileOut
from app.models.datasets import DatasetOut
from app.models.listeners import EventListenerJob, EventListenerDatasetMessage, EventListenerMessage


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

    # Create an entry in job history with unique ID
    job = EventListenerJob(
        listener_name = routing_key,
        resource_ref = MongoDBRef(
            collection="file", resource_id=file_out.id, version=file_out.version_num
        ),
        parameters=parameters
    )

    current_id = file_out.id
    current_datasetId = file_out.dataset_id
    current_secretKey = token
    try:
        msg_body = EventListenerMessage(
            filename=file_out.name,
            fileSize=file_out.bytes,
            id=str(current_id),
            datasetId=str(current_datasetId),
            secretKey=current_secretKey,
            job_id=job.id
        )
    except Exception as e:
        print(e)

    rabbitmq_client.basic_publish(
        exchange="",
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

    # Create an entry in job history with unique ID
    job = EventListenerJob(
        listener_name=routing_key,
        resource_ref=MongoDBRef(
            collection="dataset", resource_id=dataset_out.id
        ),
        parameters=parameters
    )
    
    msg_body = EventListenerDatasetMessage(
        datasetName=dataset_out.name,
        id=str(dataset_out.id),
        datasetId=str(dataset_out.id),
        secretKey=token,
        job_id=job.id
    )

    rabbitmq_client.basic_publish(
        exchange="",
        routing_key=routing_key,
        body=json.dumps(msg_body.dict(), ensure_ascii=False),
        properties=pika.BasicProperties(
            content_type="application/json", delivery_mode=1
        ),
    )
    return {"message": "testing", "dataset_id": dataset_out.id}
