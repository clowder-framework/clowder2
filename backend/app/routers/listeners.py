import datetime
import os
import re
import random
import string
from packaging import version
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app.dependencies import get_db
from app.keycloak_auth import get_user, get_current_user
from app.models.feeds import FeedDB, FeedOut, FeedListener
from app.models.config import ConfigEntryDB, ConfigEntryOut
from app.models.search import SearchCriteria
from app.models.listeners import (
    ExtractorInfo,
    EventListenerIn,
    LegacyEventListenerIn,
    EventListenerDB,
    EventListenerOut,
)
from app.routers.feeds import disassociate_listener_db

router = APIRouter()
legacy_router = APIRouter()  # for back-compatibilty with v1 extractors

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


def _process_incoming_v1_extractor_info(
    extractor_name: str,
    extractor_id: str,
    process: dict,
    db: MongoClient,
):
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
                        SearchCriteria(field="content_type_main", value=main_type)
                    )
                else:
                    # Otherwise match the whole string
                    criteria_list.append(
                        SearchCriteria(field="content_type", value=mime)
                    )
            else:
                criteria_list.append(SearchCriteria(field="content_type", value=mime))

        # TODO: Who should the author be for an auto-generated feed? Currently None.
        new_feed = FeedDB(
            name=extractor_name,
            search={
                "index_name": "file",
                "criteria": criteria_list,
                "mode": "or",
            },
            listeners=[FeedListener(listener_id=extractor_id, automatic=True)],
        )
        return new_feed.to_mongo()
        db["feeds"].insert_one(new_feed.to_mongo())


@router.get("/instance")
async def get_instance_id(
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    # Check all connection and abort if any one of them is not available
    if db is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    if (instance_id := await db["config"].find_one({"key": "instance_id"})) is not None:
        return ConfigEntryOut.from_mongo(instance_id).value
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
        found = await db["config"].find_one({"key": "instance_id"})
        new_entry = ConfigEntryOut.from_mongo(found)
        return instance_id


@router.post("", response_model=EventListenerOut)
async def save_listener(
    listener_in: EventListenerIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    """Register a new Event Listener with the system."""
    listener = EventListenerDB(**listener_in.dict(), creator=user)
    # TODO: Check for duplicates somehow?
    new_listener = await db["listeners"].insert_one(listener.to_mongo())
    found = await db["listeners"].find_one({"_id": new_listener.inserted_id})
    listener_out = EventListenerOut.from_mongo(found)
    return listener_out


@legacy_router.post("", response_model=EventListenerOut)
async def save_legacy_listener(
    legacy_in: LegacyEventListenerIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    """This will take a POST with Clowder v1 extractor_info included, and convert/update to a v2 Listener."""
    listener_properties = ExtractorInfo(**legacy_in.dict())
    listener = EventListenerDB(
        name=legacy_in.name,
        version=legacy_in.version,
        description=legacy_in.description,
        creator=user,
        properties=listener_properties,
    )

    # check to see if extractor already exists and update if so
    existing_extractor = await db["listeners"].find_one({"name": legacy_in.name})
    if existing_extractor is not None:
        # Update existing listener
        extractor_out = EventListenerOut.from_mongo(existing_extractor)
        existing_version = extractor_out.version
        new_version = listener.version
        if version.parse(new_version) > version.parse(existing_version):
            # if this is a new version, add it to the database
            new_extractor = await db["listeners"].insert_one(listener.to_mongo())
            found = await db["listeners"].find_one({"_id": new_extractor.inserted_id})
            # TODO - for now we are not deleting an older version of the extractor, just adding a new one
            # removed = db["listeners"].delete_one({"_id": existing_extractor["_id"]})
            extractor_out = EventListenerOut.from_mongo(found)
            return extractor_out
        else:
            # otherwise return existing version
            # TODO: Should this fail the POST instead?
            return extractor_out
    else:
        # Register new listener
        new_listener = await db["listeners"].insert_one(listener.to_mongo())
        found = await db["listeners"].find_one({"_id": new_listener.inserted_id})
        listener_out = EventListenerOut.from_mongo(found)

        # Assign MIME-based listener if needed
        if listener_out.properties and listener_out.properties.process:
            process = listener_out.properties.process
            processed_feed = _process_incoming_v1_extractor_info(
                legacy_in.name, listener_out.id, process, db
            )
            await db["feeds"].insert_one(processed_feed)

        return listener_out


@router.get("/search", response_model=List[EventListenerOut])
async def search_listeners(
    db: MongoClient = Depends(get_db),
    text: str = "",
    skip: int = 0,
    limit: int = 2,
):
    """Search all Event Listeners in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """
    listeners = []

    query_regx = re.compile(text, re.IGNORECASE)

    for doc in (
        # TODO either use regex or index search
        await db["listeners"]
        .find({"$or": [{"name": query_regx}, {"description": query_regx}]})
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        listeners.append(EventListenerOut.from_mongo(doc))
    return listeners


@router.get("/categories", response_model=List[str])
async def list_categories(
    db: MongoClient = Depends(get_db),
):
    """Get all the distinct categories of registered listeners in the db

    Arguments:
    """
    return await db["listeners"].distinct("properties.categories")


@router.get("/defaultLabels", response_model=List[str])
async def list_default_labels(
    db: MongoClient = Depends(get_db),
):
    """Get all the distinct default labels of registered listeners in the db

    Arguments:
    """
    return await db["listeners"].distinct("properties.defaultLabels")


@router.get("/{listener_id}", response_model=EventListenerOut)
async def get_listener(listener_id: str, db: MongoClient = Depends(get_db)):
    """Return JSON information about an Event Listener if it exists."""
    if (
        listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
    ) is not None:
        return EventListenerOut.from_mongo(listener)
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.get("", response_model=List[EventListenerOut])
async def get_listeners(
    user_id=Depends(get_user),
    db: MongoClient = Depends(get_db),
    skip: int = 0,
    limit: int = 2,
    category: Optional[str] = None,
    label: Optional[str] = None,
):
    """Get a list of all Event Listeners in the db.

    Arguments:
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
        category -- filter by category has to be exact match
        label -- filter by label has to be exact match
    """
    listeners = []
    if category and label:
        query = {
            "$and": [
                {"properties.categories": category},
                {"properties.defaultLabels": label},
            ]
        }
    elif category:
        query = {"properties.categories": category}
    elif label:
        query = {"properties.defaultLabels": label}
    else:
        query = {}

    for doc in (
        await db["listeners"].find(query).skip(skip).limit(limit).to_list(length=limit)
    ):
        listeners.append(EventListenerOut.from_mongo(doc))
    return listeners


@router.put("/{listener_id}", response_model=EventListenerOut)
async def edit_listener(
    listener_id: str,
    listener_in: EventListenerIn,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
):
    """Update the information about an existing Event Listener..

    Arguments:
        listener_id -- UUID of the listener to be udpated
        listener_in -- JSON object including updated information
    """
    if (
        listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        listener_update = dict(listener_in) if listener_in is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        listener_update["updated"] = datetime.datetime.utcnow()
        try:
            listener.update(listener_update)
            await db["listeners"].replace_one(
                {"_id": ObjectId(listener_id)}, EventListenerDB(**listener).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return EventListenerOut.from_mongo(listener)
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}")
async def delete_listener(
    listener_id: str,
    db: MongoClient = Depends(get_db),
):
    """Remove an Event Listener from the database. Will not clear event history for the listener."""
    if (await db["listeners"].find_one({"_id": ObjectId(listener_id)})) is not None:
        # unsubscribe the listener from any feeds
        async for feed in db["feeds"].find(
            {"listeners.listener_id": ObjectId(listener_id)}
        ):
            feed_out = FeedOut.from_mongo(feed)
            disassociate_listener_db(feed_out.id, listener_id, db)
        await db["listeners"].delete_one({"_id": ObjectId(listener_id)})
        return {"deleted": listener_id}
    else:
        raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")
