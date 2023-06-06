import datetime
import os
import random
import string
from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import Or, RegEx
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from packaging import version

from app.keycloak_auth import get_user, get_current_user, get_current_username
from app.models.config import ConfigEntryDB
from app.models.feeds import FeedDB, FeedListener
from app.models.listeners import (
    ExtractorInfo,
    EventListenerIn,
    LegacyEventListenerIn,
    EventListenerDB,
    EventListenerOut,
)
from app.models.search import SearchCriteria
from app.models.users import UserOut
from app.routers.feeds import disassociate_listener_db

router = APIRouter()
legacy_router = APIRouter()  # for back-compatibilty with v1 extractors

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _process_incoming_v1_extractor_info(
    extractor_name: str,
    extractor_id: str,
    process: dict,
    creator: Optional[UserOut] = None,
):
    """Return FeedDB object given v1 extractor info."""
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
        if creator is not None:
            new_feed.creator = creator.email
        await new_feed.insert()
        return new_feed


@router.get("/instance")
async def get_instance_id(
    user=Depends(get_current_user),
):
    instance_id = await ConfigEntryDB.find_one({ConfigEntryDB.key == "instance_id"})
    if instance_id:
        return instance_id.value
    else:
        # If no ID has been generated for this instance, generate a 10-digit alphanumeric identifier
        instance_id = "".join(
            random.choice(
                string.ascii_uppercase + string.ascii_lowercase + string.digits
            )
            for _ in range(10)
        )
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        await config_entry.insert()
        return config_entry


@router.post("", response_model=EventListenerOut)
async def save_listener(
    listener_in: EventListenerIn,
    user=Depends(get_current_user),
):
    """Register a new Event Listener with the system."""
    listener = EventListenerDB(**listener_in.dict(), creator=user)
    # TODO: Check for duplicates somehow?
    return listener.dict()
    await listener.insert()


@legacy_router.post("", response_model=EventListenerOut)
async def save_legacy_listener(
    legacy_in: LegacyEventListenerIn,
    user=Depends(get_current_user),
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

    # check to see if extractor already exists and update if so, otherwise return existing
    if (
        existing := await EventListenerDB.find_one(
            EventListenerDB.name == legacy_in.name
        )
    ) is not None:
        # if this is a new version, add it to the database, otherwise update existing
        if version.parse(listener.version) > version.parse(existing.version):
            listener.id = existing.id
            existing = EventListenerDB(*listener.dict())
            await existing.save()
            #  TODO: Should older extractor version entries be deleted?
            return existing.dict()
        else:
            # TODO: Should this fail the POST instead?
            return existing.dict()
    else:
        # Register new listener
        await listener.insert()
        # Assign a MIME-based listener if necessary
        if listener.properties and listener.properties.process:
            await _process_incoming_v1_extractor_info(
                legacy_in.name, listener.id, listener.properties.process, user
            )
        return listener.dict()


@router.get("/search", response_model=List[EventListenerOut])
async def search_listeners(
    text: str = "", skip: int = 0, limit: int = 2, user=Depends(get_current_username)
):
    """Search all Event Listeners in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """
    # TODO either use regex or index search
    listeners = (
        await EventListenerDB.find(
            Or(
                RegEx(field=EventListenerDB.name, pattern=text),
                RegEx(field=EventListenerDB.description, pattern=text),
            ),
        )
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return [listener.dict() for listener in listeners]


@router.get("/categories", response_model=List[str])
async def list_categories(user=Depends(get_current_username)):
    """Get all the distinct categories of registered listeners in the db"""
    return await EventListenerDB.distinct(EventListenerDB.properties.categories)


@router.get("/defaultLabels", response_model=List[str])
async def list_default_labels(user=Depends(get_current_username)):
    """Get all the distinct default labels of registered listeners in the db"""
    return await EventListenerDB.distinct(EventListenerDB.properties.default_labels)


@router.get("/{listener_id}", response_model=EventListenerOut)
async def get_listener(listener_id: str, user=Depends(get_current_username)):
    """Return JSON information about an Event Listener if it exists."""
    if (
        listener := await EventListenerDB.get(PydanticObjectId(listener_id))
    ) is not None:
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.get("", response_model=List[EventListenerOut])
async def get_listeners(
    user_id=Depends(get_current_username),
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
    query = []
    if category:
        query.append(EventListenerDB.properties.categories == category)
    if label:
        query.append(EventListenerDB.properties.default_labels == label)

    listeners = await EventListenerDB.find(*query, skip=skip, limit=limit).to_list()
    return [listener.dict() for listener in listeners]


@router.put("/{listener_id}", response_model=EventListenerOut)
async def edit_listener(
    listener_id: str,
    listener_in: EventListenerIn,
    user_id=Depends(get_user),
):
    """Update the information about an existing Event Listener..

    Arguments:
        listener_id -- UUID of the listener to be udpated
        listener_in -- JSON object including updated information
    """
    listener = await EventListenerDB.find_one(
        EventListenerDB.id == ObjectId(listener_id)
    )
    if listener:
        # TODO: Refactor this with permissions checks etc.
        listener_update = dict(listener_in) if listener_in is not None else {}
        listener_update["modified"] = datetime.datetime.utcnow()
        try:
            listener.update(listener_update)
            await listener.save()
            return listener.dict()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}")
async def delete_listener(
    listener_id: str,
    user=Depends(get_current_username),
):
    """Remove an Event Listener from the database. Will not clear event history for the listener."""
    listener = await EventListenerDB.find_one(
        EventListenerDB.id == ObjectId(listener_id)
    )
    if listener:
        # unsubscribe the listener from any feeds
        async for feed in FeedDB.find(
            FeedDB.listeners.listener_id == ObjectId(listener_id)
        ):
            await disassociate_listener_db(feed.id, listener_id)
        await listener.delete()
        return {"deleted": listener_id}
    raise HTTPException(status_code=404, detail=f"Listener {listener_id} not found")
