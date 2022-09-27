from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from pymongo import MongoClient
import datetime
from app import dependencies
from app import keycloak_auth
from app.keycloak_auth import get_user, get_current_user
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

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.post("", response_model=FeedOut)
async def save_feed(
    feed_in: FeedIn,
    user=Depends(keycloak_auth.get_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    feed = FeedDB(**feed_in.dict, author=user)
    new_feed = await db["feeds"].insert_one(feed.to_mongo())
    found = await db["feeds"].find_one({"_id": new_feed.inserted_id})
    feed_out = FeedOut.from_mongo(found)
    return feed_out

