from typing import List
import os
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from pymongo import MongoClient
import datetime
from app.dependencies import get_db
from app.keycloak_auth import get_user, get_current_user
from app.models.listeners import (
    ListenerProperties,
    ListenerIn,
    LegacyListenerIn,
    ListenerDB,
    ListenerOut,
)

router = APIRouter()
legacy_router = APIRouter()  # for back-compatibilty with v1 extractors

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.post("", response_model=ListenerOut)
async def save_listener(
    listener_in: ListenerIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(get_db),
):
    listener = ListenerDB(**listener_in.dict(), author=user)
    new_listener = await db["listeners"].insert_one(listener.to_mongo())
    found = await db["listeners"].find_one({"_id": new_listener.inserted_id})
    listener_out = ListenerOut.from_mongo(found)
    return listener_out


@legacy_router.post("", response_model=ListenerOut)
async def save_legacy_listener(
    legacy_in: LegacyListenerIn,
    user=Depends(get_user),
    db: MongoClient = Depends(get_db),
):
    """This will take a POST with Clowder v1 extractor_info dict info, and convert to a v2 Listener."""
    listener_properties = ListenerProperties(**legacy_in.dict)
    listener = ListenerDB(
        name=legacy_in.name,
        version=int(legacy_in.version),
        description=legacy_in.description,
        author=user,
        properties=listener_properties,
    )
    new_listener = await db["listeners"].insert_one(listener.to_mongo())
    found = await db["listeners"].find_one({"_id": new_listener.inserted_id})
    listener_out = ListenerOut.from_mongo(found)

    # TODO: Automatically match or create a Feed based on listener_in.process rules
    for process_key in listener_properties.process:
        if process_key == "file":
            mimetypes = listener_properties.process[process_key]
            new_feed = {
                "name": legacy_in.name + " " + legacy_in.version,
                "mode": "or",
                "listeners": [{"listener_id": listener_out.id, "automatic": True}],
                "criteria": []
            }
            for mimetype in mimetypes:
                new_feed["criteria"].append({"field": "MIMEtype", "operator": "==", "value": mimetype})

            # Save feed
            pass

    return listener_out


@router.get("/{listener_id}", response_model=ListenerOut)
async def get_listener(listener_id: str, db: MongoClient = Depends(get_db)):
    if (
        listener := await db["listeners"].find_one({"_id": ObjectId(listener_id)})
    ) is not None:
        return ListenerOut.from_mongo(listener)
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.get("", response_model=List[ListenerOut])
async def get_listeners(
    user_id=Depends(get_user),
    db: MongoClient = Depends(get_db),
    skip: int = 0,
    limit: int = 2,
):
    listeners = []
    for doc in (
        await db["listeners"].find().skip(skip).limit(limit).to_list(length=limit)
    ):
        listeners.append(ListenerOut.from_mongo(doc))
    return listeners


@router.put("/{listener_id}", response_model=ListenerOut)
async def edit_listener(
    listener_id: str,
    listener_in: ListenerIn,
    db: MongoClient = Depends(get_db),
    user_id=Depends(get_user),
):
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
                {"_id": ObjectId(listener_id)}, ListenerDB(**listener).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return ListenerOut.from_mongo(listener)
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}")
async def delete_listener(
    listener_id: str,
    db: MongoClient = Depends(get_db),
):
    if (await db["listeners"].find_one({"_id": ObjectId(listener_id)})) is not None:
        # delete dataset first to minimize files/folder being uploaded to a delete dataset

        await db["listeners"].delete_one({"_id": ObjectId(listener_id)})
        return {"deleted": listener_id}
    else:
        raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")
