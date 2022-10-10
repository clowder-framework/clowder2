import json
import pika
from fastapi import Request, HTTPException, Depends
from pymongo import MongoClient
from bson import ObjectId
from pika.adapters.blocking_connection import BlockingChannel

from app.keycloak_auth import get_token
from app import dependencies
from app.models.files import FileOut
from app.models.listeners import ListenerMessage


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
    msg_body = ListenerMessage(
        filename=file_out.name,
        fileSize=file_out.bytes,
        id=file_out.id,
        datasetId=file_out.dataset_id,
        secretKey=token
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
    return {"message": "testing", "file_id": file_out.id}
