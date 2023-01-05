import datetime
import os
import re
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app.dependencies import get_db
from app.keycloak_auth import get_user, get_current_user
from app.models.feeds import FeedOut
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
    user=Depends(get_user),
    db: MongoClient = Depends(get_db),
):
    """This will take a POST with Clowder v1 extractor_info included, and convert/update to a v2 Listener."""
    listener_properties = ExtractorInfo(**legacy_in.dict)
    listener = EventListenerDB(
        name=legacy_in.name,
        version=int(legacy_in.version),
        description=legacy_in.description,
        creator=user,
        properties=listener_properties,
    )
    new_listener = await db["listeners"].insert_one(listener.to_mongo())
    found = await db["listeners"].find_one({"_id": new_listener.inserted_id})
    listener_out = EventListenerOut.from_mongo(found)

    # TODO: Automatically match or create a Feed based on listener_in.process rules
    for process_key in listener_properties.process:
        if process_key == "file":
            mimetypes = listener_properties.process[process_key]
            new_feed = {
                "name": legacy_in.name + " " + legacy_in.version,
                "mode": "or",
                "listeners": [{"listener_id": listener_out.id, "automatic": True}],
                "criteria": [],
            }
            for mimetype in mimetypes:
                new_feed["criteria"].append(
                    {"field": "MIMEtype", "operator": "==", "value": mimetype}
                )

            # Save feed
            pass

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
    categories: Optional[list[str]] = None,
):
    """Get a list of all Event Listeners in the db.

    Arguments:
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
        category -- filter by category has to be exact match
    """
    listeners = []

    if categories:
        for doc in (
            await db["listeners"]
            .find({"properties.categories": {"$all": categories}})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            listeners.append(EventListenerOut.from_mongo(doc))
    else:
        for doc in (
            await db["listeners"].find().skip(skip).limit(limit).to_list(length=limit)
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
