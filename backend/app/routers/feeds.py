from typing import List, Optional

from beanie import PydanticObjectId
from beanie.operators import NE
from fastapi import APIRouter, HTTPException, Depends
from pika.adapters.blocking_connection import BlockingChannel

from app.keycloak_auth import get_current_user, get_current_username
from app.models.feeds import (
    FeedIn,
    FeedDB,
    FeedOut,
)
from app.models.files import FileOut
from app.models.listeners import (
    FeedListener,
    EventListenerDB,
)
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_file_job
from app.search.connect import check_search_result

router = APIRouter()


# TODO: Move this to MongoDB middle layer
async def disassociate_listener_db(feed_id: str, listener_id: str):
    """Remove a specific Event Listener from a feed. Does not delete either resource, just removes relationship.

    This actually performs the database operations, and can be used by any endpoints that need this functionality.
    """
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        new_listeners = []
        for feed_listener in feed.listeners:
            if feed_listener.listener_id != listener_id:
                new_listeners.append(feed_listener)
        feed.listeners = new_listeners
        await feed.save()


async def check_feed_listeners(
        es_client,
        file_out: FileOut,
        user: UserOut,
        rabbitmq_client: BlockingChannel,
        token: str,
):
    """Automatically submit new file to listeners on feeds that fit the search criteria."""
    listener_ids_found = []
    feeds = await FeedDB.find(NE(FeedDB.listeners, []))
    for feed in feeds:
        # Only proceed if feed actually has auto-triggering listeners
        if any(map(lambda li: li.automatic, feed.listeners)):
            # Verify whether resource_id is found when searching the specified criteria
            feed_match = check_search_result(es_client, file_out, feed.search)
            if feed_match:
                for listener in feed.listeners:
                    if listener.automatic:
                        listener_ids_found.append(listener.listener_id)
    for targ_listener in listener_ids_found:
        if (
                listener_info := await EventListenerDB.get(PydanticObjectId(targ_listener))
        ) is not None:
            await submit_file_job(
                file_out,
                listener_info.name,  # routing_key
                {},  # parameters
                user,
                rabbitmq_client,
                token,
            )
    return listener_ids_found


@router.post("", response_model=FeedOut)
async def save_feed(
        feed_in: FeedIn,
        user=Depends(get_current_username),
):
    """Create a new Feed (i.e. saved search) in the database."""
    feed = FeedDB(**feed_in.dict(), creator=user)
    await feed.save()
    return FeedOut(**feed.dict())


@router.get("", response_model=List[FeedOut])
async def get_feeds(
        name: Optional[str] = None,
        user=Depends(get_current_user),
        skip: int = 0,
        limit: int = 10,
):
    """Fetch all existing Feeds."""
    if name is not None:
        return (
            await FeedDB.find(FeedDB.name == name)
            .sort(-FeedDB.created)
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )
    else:
        return (
            await FeedDB.find()
            .sort(-FeedDB.created)
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )


@router.get("/{feed_id}", response_model=FeedOut)
async def get_feed(
        feed_id: str,
        user=Depends(get_current_user),
):
    """Fetch an existing saved search Feed."""
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        return FeedOut(**feed.dict())
    else:
        raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.delete("/{feed_id}")
async def delete_feed(
        feed_id: str,
        user=Depends(get_current_user),
):
    """Delete an existing saved search Feed."""
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        await feed.delete()
        return {"deleted": feed_id}
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.post("/{feed_id}/listeners", response_model=FeedOut)
async def associate_listener(
        feed_id: str,
        listener: FeedListener,
        user=Depends(get_current_user),
):
    """Associate an existing Event Listener with a Feed, e.g. so it will be triggered on new Feed results.

    Arguments:
        feed_id: Feed that should have new Event Listener associated
        listener: JSON object with "listener_id" field and "automatic" bool field (whether to auto-trigger on new data)
    """
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        if (
                exists := await EventListenerDB.get(PydanticObjectId(listener.listener_id))
        ) is not None:
            feed.listeners.append(listener)
            await feed.save()
            return FeedOut(**feed.dict())
        raise HTTPException(
            status_code=404, detail=f"listener {listener.listener_id} not found"
        )
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")


@router.delete("/{feed_id}/listeners/{listener_id}", response_model=FeedOut)
async def disassociate_listener(
        feed_id: str,
        listener_id: str,
        user=Depends(get_current_user),
):
    """Disassociate an Event Listener from a Feed.

    Arguments:
        feed_id: UUID of search Feed that is being changed
        listener_id: UUID of Event Listener that should be disassociated
    """
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        await disassociate_listener_db(feed_id, listener_id)
        return {"disassociated": listener_id}
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")
