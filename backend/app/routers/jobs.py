from typing import List, Optional
import re
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pymongo import MongoClient

from app import dependencies
from app.models.listeners import (
    EventListenerJobDB,
    EventListenerJobUpdateDB,
    EventListenerJobViewList,
)
from app.keycloak_auth import get_current_user, get_user, get_current_username

router = APIRouter()


@router.get("", response_model=List[EventListenerJobDB])
async def get_all_job_summary(
    current_user_id=Depends(get_user),
    listener_id: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    file_id: Optional[str] = None,
    dataset_id: Optional[str] = None,
    created: Optional[str] = None,
    skip: int = 0,
    limit: int = 2,
):
    """
    Get a list of all jobs from the db.
    Arguments:
        listener_id -- listener id
        status -- filter by status
        user_id -- filter by user id
        file_id -- filter by file id
        dataset_id -- filter by dataset id
        created: Optional[datetime] = None,
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """
    filters = [
        {
            "$or": [
                {"creator.email": current_user_id},
                {"auth": {"$elemMatch": {"user_id": {"$eq": current_user_id}}}},
            ]
        }
    ]
    if listener_id is not None:
        filters.append({"listener_id": listener_id})
    if status is not None:
        filters.append({"status": re.compile(status, re.IGNORECASE)})
    if created is not None:
        created_datetime_object = datetime.strptime(created, "%Y-%m-%d")
        filters.append(
            {
                "created": {
                    "$gte": created_datetime_object,
                    "$lt": created_datetime_object + timedelta(days=1),
                }
            }
        )
    if user_id is not None:
        filters.append({"creator.email": user_id})
    if file_id is not None:
        filters.append({"resource_ref.collection": "file"})
        filters.append({"resource_ref.resource_id": ObjectId(file_id)})
    if dataset_id is not None:
        filters.append({"resource_ref.collection": "dataset"})
        filters.append({"resource_ref.resource_id": ObjectId(dataset_id)})

    return (
        await EventListenerJobViewList.find({"$and": filters})
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )


@router.get("/{job_id}/summary", response_model=EventListenerJobDB)
async def get_job_summary(
    job_id: str,
    user=Depends(get_current_username),
):
    job = await EventListenerJobDB.find_one(EventListenerJobDB.id == ObjectId(job_id))
    if job:
        return job
    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")


@router.get("/{job_id}/updates")
async def get_job_updates(
    job_id: str,
    user=Depends(get_current_username),
):
    job = await EventListenerJobDB.find_one(EventListenerJobDB.id == ObjectId(job_id))
    if job:
        # TODO: Should this also return the job summary data since we just queried it here?
        return await EventListenerJobUpdateDB.find(
            EventListenerJobUpdateDB.job_id == job_id
        )
    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
