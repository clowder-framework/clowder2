from datetime import datetime, timedelta
from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import GTE, LT, Or, RegEx
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.keycloak_auth import get_current_username, get_user
from app.models.listeners import (
    EventListenerJobDB,
    EventListenerJobOut,
    EventListenerJobUpdateDB,
    EventListenerJobUpdateOut,
    EventListenerJobViewList,
)

router = APIRouter()


@router.get("", response_model=List[EventListenerJobOut])
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
        Or(
            EventListenerJobViewList.creator.email == current_user_id,
            EventListenerJobViewList.auth.user_id == current_user_id,
        ),
    ]
    if listener_id is not None:
        filters.append(EventListenerJobViewList.listener_id == listener_id)
    if status is not None:
        filters.append(RegEx(field=EventListenerJobViewList.status, pattern=status))
    if created is not None:
        created_datetime_object = datetime.strptime(created, "%Y-%m-%d")
        filters.append(GTE(EventListenerJobViewList.created, created_datetime_object))
        filters.append(
            LT(
                EventListenerJobViewList.created,
                created_datetime_object + timedelta(days=1),
            )
        )
    if user_id is not None:
        filters.append(EventListenerJobViewList.creator.email == user_id)
    if file_id is not None:
        filters.append(EventListenerJobViewList.resource_ref.collection == "files")
        filters.append(
            EventListenerJobViewList.resource_ref.resource_id == ObjectId(file_id)
        )
    if dataset_id is not None:
        filters.append(EventListenerJobViewList.resource_ref.collection == "datasets")
        filters.append(
            EventListenerJobViewList.resource_ref.resource_id == ObjectId(dataset_id)
        )
    jobs = (
        await EventListenerJobViewList.find(*filters).skip(skip).limit(limit).to_list()
    )
    return [job.dict() for job in jobs]


@router.get("/{job_id}/summary", response_model=EventListenerJobOut)
async def get_job_summary(
    job_id: str,
    user=Depends(get_current_username),
):
    if (job := await EventListenerJobDB.get(PydanticObjectId(job_id))) is not None:
        return job.dict()
    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")


@router.get("/{job_id}/updates", response_model=List[EventListenerJobUpdateOut])
async def get_job_updates(
    job_id: str,
    user=Depends(get_current_username),
):
    if (job := await EventListenerJobDB.get(PydanticObjectId(job_id))) is not None:
        # TODO: Should this also return the job summary data since we just queried it here?
        job_updates = await EventListenerJobUpdateDB.find(
            EventListenerJobUpdateDB.job_id == job_id
        ).to_list()
        return [job_update.dict() for job_update in job_updates]
    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
