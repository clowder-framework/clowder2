from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from pymongo import MongoClient
import datetime
from app.dependencies import get_db
from app.keycloak_auth import get_user, get_current_user
from app.models.users import UserOut
from app.models.listeners import (
    FeedListener,
    ListenerOut,
)
from app.models.feeds import (
    FeedIn,
    FeedDB,
    FeedOut,
)
from app.models.search import SearchIndexContents
from app.elastic_search.connect import verify_match

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


# TODO: Move this to MongoDB middle layer
async def disassociate_listener_db(feed_id: str, listener_id: str, db: MongoClient):
    """Remove a specific listener_id from the listeners associated with a feed."""
    async for feed in db["feeds"].find({"listeners.listener_id": ObjectId(listener_id)}):
        feed_db = FeedDB.from_mongo(feed)
        new_listeners = []
        for feed_listener in feed_db.listeners:
            if feed_listener.listener_id != listener_id:
                new_listeners.append(feed_listener)
        feed_db.listeners = new_listeners
        await db["feeds"].replace_one(
            {"_id": ObjectId(feed_id)}, FeedDB(**feed_db).to_mongo()
        )


async def check_feed_triggers(
    es_client,
    new_index: SearchIndexContents,
    user: UserOut,
    db: MongoClient,
):
    """Automatically submit jobs to listeners on feeds that fit the new search criteria."""
    listeners_found = []
    async for feed in db["feeds"].find({"listeners": {"$ne": []}}):
        feed_db = FeedDB(**feed)

        # If feed doesn't have any auto-triggering listeners, we're done
        found_auto = False
        for listener in feed_db.listeners:
            if listener.automatic:
                found_auto = True
                break

        if found_auto:
            # Verify whether resource_id is found when searching the specified criteria
            feed_match = verify_match(es_client, new_index, feed_db.search)
            if feed_match:
                for listener in feed_db.listeners:
                    if listener.automatic:
                        listeners_found.append(listener.listener_id)

    print(listeners_found)
    return listeners_found


@router.post("", response_model=FeedOut)
async def save_feed(
    feed_in: FeedIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    feed = FeedDB(**feed_in.dict(), author=user)
    new_feed = await db["feeds"].insert_one(feed.to_mongo())
    found = await db["feeds"].find_one({"_id": new_feed.inserted_id})
    feed_out = FeedOut.from_mongo(found)
    return feed_out


@router.delete("/{feed_id}")
async def delete_feed(
        feed_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(get_db),
):
    if (await db["feeds"].find_one({"_id": ObjectId(feed_id)})) is not None:
        await db["feeds"].delete_one({"_id": ObjectId(feed_id)})
        return {"deleted": feed_id}
    else:
        raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.post("/{feed_id}/listeners", response_model=FeedOut)
async def associate_listener(
    feed_id: str,
    listener: FeedListener,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    if (feed := await db["feeds"].find_one({"_id": ObjectId(feed_id)})) is not None:
        feed_out = FeedOut.from_mongo(feed)
        if (
            listener_q := await db["listeners"].find_one(
                {"_id": ObjectId(listener.listener_id)}
            )
        ) is not None:
            feed_out.listeners.append(listener)
            await db["feeds"].replace_one(
                {"_id": ObjectId(feed_id)}, FeedDB(**feed_out.dict()).to_mongo()
            )
            return feed_out
        raise HTTPException(
            status_code=404, detail=f"listener {listener.listener_id} not found"
        )
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")

@router.delete("/{feed_id}/listeners/{listener_id}", response_model=FeedOut)
async def disassociate_listener(
    feed_id: str,
    listener_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    if (feed := await db["feeds"].find_one({"_id": ObjectId(feed_id)})) is not None:
        disassociate_listener_db(feed_id, listener_id, db)
        return {"disassociated": listener_id}
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")
