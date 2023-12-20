from typing import List, Optional

from app.keycloak_auth import get_current_user, get_current_username
from app.models.feeds import FeedDB, FeedIn, FeedOut
from app.models.files import FileOut
from app.models.listeners import EventListenerDB, FeedListener
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_file_job
from app.search.connect import check_search_result
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from pika.adapters.blocking_connection import BlockingChannel

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
):
    """Automatically submit new file to listeners on feeds that fit the search criteria."""
    listener_ids_found = []
    async for feed in FeedDB.find(FeedDB.listeners.automatic == True):  # noqa: E712
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
            )
    return listener_ids_found


@router.post("", response_model=FeedOut)
async def save_feed(
    feed_in: FeedIn,
    user=Depends(get_current_username),
):
    """Create a new Feed (i.e. saved search) in the database."""
    feed = FeedDB(**feed_in.dict(), creator=user)
    await feed.insert()
    return feed.dict()


@router.get("", response_model=List[FeedOut])
async def get_feeds(
    name: Optional[str] = None,
    user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 10,
):
    """Fetch all existing Feeds."""
    if name is not None:
        feeds = (
            await FeedDB.find(FeedDB.name == name)
            .sort(-FeedDB.created)
            .skip(skip)
            .limit(limit)
            .to_list()
        )
    else:
        feeds = (
            await FeedDB.find().sort(-FeedDB.created).skip(skip).limit(limit).to_list()
        )

    return [feed.dict() for feed in feeds]


@router.get("/{feed_id}", response_model=FeedOut)
async def get_feed(
    feed_id: str,
    user=Depends(get_current_user),
):
    """Fetch an existing saved search Feed."""
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        return feed.dict()
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
            await EventListenerDB.get(PydanticObjectId(listener.listener_id))
        ) is not None:
            feed.listeners.append(listener)
            await feed.save()
            return feed.dict()
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
    if (await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        await disassociate_listener_db(feed_id, listener_id)
        return {"disassociated": listener_id}
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")
