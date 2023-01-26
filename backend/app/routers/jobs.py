from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from pymongo import MongoClient

from app import dependencies
from app.models.listeners import EventListenerJob, EventListenerJobUpdate

router = APIRouter()


@router.get("/{job_id}/summary", response_model=EventListenerJob)
async def get_job_summary(
    job_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (job := await db["listener_jobs"].find_one({"_id": ObjectId(job_id)})) is not None:
        return EventListenerJob.from_mongo(job)

    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")


@router.get("/{job_id}/updates")
async def get_job_updates(
    job_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (job := await db["listener_jobs"].find_one({"_id": ObjectId(job_id)})) is not None:
        # TODO: Should this also return the job summary data since we just queried it here?
        events = []
        async for update in db["listener_job_updates"].find({"job_id": job_id}):
            event_json = EventListenerJobUpdate.from_mongo(update)
            events.append(event_json)
        return events

    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
