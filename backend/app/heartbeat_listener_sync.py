import json
import logging
import pika
from beanie import PydanticObjectId

from app.config import settings
from app.models.listeners import EventListenerDB, EventListenerOut, ExtractorInfo
from app.models.search import SearchCriteria
from app.routers.feeds import FeedDB, FeedListener
from packaging import version
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def callback(ch, method, properties, body):
    """This method receives messages from RabbitMQ and processes them.
    the extractor info is parsed from the message and if the extractor is new
    or is a later version, the db is updated.
    """
    msg = json.loads(body.decode("utf-8"))

    extractor_info = msg["extractor_info"]
    extractor_name = extractor_info["name"]
    extractor_description = extractor_name
    if "description" in extractor_info:
        extractor_description = extractor_info["description"]
    extractor_db = EventListenerDB(
        **extractor_info, properties=ExtractorInfo(**extractor_info)
    )
    owner = msg["owner"]
    if owner is not None:
        extractor_db.access = {"owner": owner}

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.MONGO_DATABASE]

    # check to see if extractor already exists
    if owner is None:
        existing_extractor = EventListenerDB.find_one(
            EventListenerDB.name == msg["queue"], EventListenerDB.access == None
        )
    else:
        existing_extractor = EventListenerDB.find_one(
            EventListenerDB.name == msg["queue"], EventListenerDB.access.owner == owner
        )
    if existing_extractor is not None:
        # Update existing listener
        existing_version = existing_extractor["version"]
        new_version = extractor_db.version
        if version.parse(new_version) > version.parse(existing_version):
            # if this is a new version, add it to the database
            new_extractor = EventListenerDB.insert_one(extractor_db.to_mongo())
            found = EventListenerDB.get(PydanticObjectId(new_extractor.inserted_id))
            # TODO - for now we are not deleting an older version of the extractor, just adding a new one
            # removed = EventListenerDB.delete_one(EventListenerDB.id == PydanticObjectId(existing_extractor["_id"]))
            extractor_out = EventListenerOut.from_mongo(found)
            logger.info(
                "%s updated from %s to %s"
                % (extractor_name, existing_version, new_version)
            )
            return extractor_out
    else:
        # Register new listener
        new_extractor = EventListenerDB.insert_one(extractor_db.to_mongo())
        found = EventListenerDB.get(PydanticObjectId(new_extractor.inserted_id))
        extractor_out = EventListenerOut.from_mongo(found)
        logger.info("New extractor registered: " + extractor_name)

        # Assign MIME-based listener if needed
        if extractor_out.properties and extractor_out.properties.process:
            process = extractor_out.properties.process
            if "file" in process:
                # Create a MIME-based feed for this v1 extractor
                criteria_list = []
                for mime in process["file"]:
                    main_type = mime.split("/")[0] if mime.find("/") > -1 else mime
                    sub_type = mime.split("/")[1] if mime.find("/") > -1 else None
                    if sub_type:
                        if sub_type == "*":
                            # If a wildcard, just match on main type
                            criteria_list.append(
                                SearchCriteria(
                                    field="content_type_main", value=main_type
                                )
                            )
                        else:
                            # Otherwise match the whole string
                            criteria_list.append(
                                SearchCriteria(field="content_type", value=mime)
                            )
                    else:
                        criteria_list.append(
                            SearchCriteria(field="content_type", value=mime)
                        )

                # TODO: Who should the author be for an auto-generated feed? Currently None.
                new_feed = FeedDB(
                    name=extractor_name,
                    description=extractor_description,
                    search={
                        "criteria": criteria_list,
                        "mode": "or",
                    },
                    listeners=[
                        FeedListener(listener_id=extractor_out.id, automatic=True)
                    ],
                )
                FeedDB.insert_one(new_feed.to_mongo())

        return extractor_out


def listen_for_heartbeats():
    """

    this method runs continuously listening for extractor heartbeats send over rabbitmq

    """
    credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        settings.RABBITMQ_HOST, 5672, "/", credentials
    )
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    channel.exchange_declare(
        exchange=settings.HEARTBEAT_EXCHANGE, exchange_type="fanout", durable=True
    )
    result = channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange=settings.HEARTBEAT_EXCHANGE, queue=queue_name)

    logger.info(" [*] Waiting for heartbeats. To exit press CTRL+C")
    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    channel.start_consuming()


if __name__ == "__main__":
    listen_for_heartbeats()
