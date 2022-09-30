from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from pymongo import MongoClient
import datetime
from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.models.users import UserOut
from app.models.listeners import (
    ListenerIn,
    ListenerDB,
    ListenerOut,
)
from app.models.feeds import (
    FeedIn,
    FeedDB,
    FeedOut,
)
from app.models.search import SearchIndexContents

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


def _check_name_match(value: str, operator: str, criteria: str):
    if operator == "==":
        filename_no_ext = os.path.splitext(value)[0]
        return value == criteria or filename_no_ext == criteria
    else:
        return False

async def process_search_index(
        search_index: SearchIndexContents,
        user: UserOut,
        db: MongoClient,
):
    """Automatically submit jobs to listeners on feeds that fit the new search criteria."""
    listeners_found = []
    async for feed in db["feeds"].find(
            {'listeners': {"$ne": []}}
    ):
        feed_match = True
        print(feed)
        feed_db = FeedDB(**feed)

        # If feed doesn't have any auto-triggering listeners, we're done
        found_auto = False
        for listener in feed_db.listeners:
            if listener.automatic:
                found_auto = True

        if found_auto:
            for criteria in feed_db.criteria:
                if criteria.field == "name":
                    if not _check_name_match(search_index.name, criteria.operator, criteria.value):
                        feed_match = False

            if feed_match:
                # No criteria rules rejected file, so submit to listeners
                for listener in feed_db.listeners:
                    if listener.automatic:
                        listeners_found.append(listener.listener_id)

    print(listeners_found)
    return listeners_found

@router.post("", response_model=FeedOut)
async def save_feed(
    feed_in: FeedIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    feed = FeedDB(**feed_in.dict(), author=user)
    new_feed = await db["feeds"].insert_one(feed.to_mongo())
    found = await db["feeds"].find_one({"_id": new_feed.inserted_id})
    feed_out = FeedOut.from_mongo(found)
    return feed_out
