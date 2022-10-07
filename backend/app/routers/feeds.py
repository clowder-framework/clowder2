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


def _check_name_match(value: str, operator: str, criteria: str):
    if operator == "==":
        filename_no_ext = os.path.splitext(value)[0]
        return value == criteria or filename_no_ext == criteria
    else:
        return False


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


@router.post("/{feed_id}/listeners", response_model=FeedOut)
async def assign_listener(
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
