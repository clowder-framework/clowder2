import io
from datetime import datetime
from typing import Optional, List

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient
from bson import ObjectId

from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.models.pyobjectid import PyObjectId
from app.models.metadata import MongoDBRef
from app.models.feeds import SearchCriteria, FeedIn, FeedDB, FeedOut
from app.models.listeners import ListenerOut

router = APIRouter()


def _execute_search_feed(
        criteria: List[SearchCriteria]
):
    """Perform search represented by Feed and return matching resources."""
    results: List[MongoDBRef] = []
    return results


@router.post("/", response_model=FeedOut)
async def save_feed(
        feed_in: FeedIn,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    feed_db = FeedDB(**feed_in.dict(), author=user)
    new_feed = await db["feeds"].insert_one(feed_db.to_mongo())
    found = await db["feeds"].find_one({"_id": new_feed.inserted_id})
    feed_out = FeedOut.from_mongo(found)
    return feed_out


@router.get("/", response_model=FeedOut)
async def get_feeds(
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
    mine: bool = False,
):
    feeds = []
    if mine:
        for doc in (
                await db["feeds"]
                        .find({"creator.email": user.email})
                        .skip(skip)
                        .limit(limit)
                        .to_list(length=limit)
        ):
            feeds.append(FeedOut.from_mongo(doc))
    else:
        for doc in (
                await db["feeds"].find().skip(skip).limit(limit).to_list(length=limit)
        ):
            feeds.append(FeedOut.from_mongo(doc))
    return feeds


@router.delete("/{feed_id}")
async def delete_feed(
        feed_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    # TODO: Refactor this with permissions checks etc. - feed creator or admin only?
    if (await db["feeds"].find_one({"_id": ObjectId(feed_id)})) is not None:
        await db["feeds"].delete_one({"_id": ObjectId(feed_id)})
        return {"deleted": feed_id}
    else:
        raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.post("/{feed_id}/subscribe/{listener_id}")
async def subscribe_listener(
        feed_id: str,
        listener_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    if (
        feed := await db["feeds"].find_one({"_id": ObjectId(feed_id)})
    ) is not None:
        if (
            listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
        ) is not None:
            updated_feed = dict(feed)
            listener_out = ListenerOut(**listener)
            updated_feed["listeners"].append(listener_out)
            try:
                feed.update(updated_feed)
                await db["feeds"].replace_one(
                    {"_id": ObjectId(feed_id)}, FeedDB(**feed).to_mongo()
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=e.args[0])
            return FeedOut.from_mongo(feed)
        raise HTTPException(status_code=404, detail=f"Listener {feed_id} not found")
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.post("/{feed_id}/execute/{listener_id}")
async def execute_listener(
        feed_id: str,
        listener_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    if (
        feed := await db["feeds"].find_one({"_id": ObjectId(feed_id)})
    ) is not None:
        if (
            listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
        ) is not None:
            feed_out = FeedOut(**feed)
            results = _execute_search_feed(feed_out.criteria)
            # Submit results to listener
            pass
        raise HTTPException(status_code=404, detail=f"Listener {feed_id} not found")
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.get("/{feed_id}/counts/{listener_id}")
async def count_listener_coverage(
        feed_id: str,
        listener_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    if (
        feed := await db["feeds"].find_one({"_id": ObjectId(feed_id)})
    ) is not None:
        if (
            listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
        ) is not None:
            feed_out = FeedOut(**feed)
            results = _execute_search_feed(feed_out.criteria)
            # Check results for events from listener
            pass
        raise HTTPException(status_code=404, detail=f"Listener {feed_id} not found")
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")

