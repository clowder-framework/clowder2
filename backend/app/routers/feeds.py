from typing import Optional

from app.deps.authorization_deps import FeedAuthorization, ListenerAuthorization
from app.keycloak_auth import get_current_user, get_current_username
from app.models.feeds import FeedDB, FeedIn, FeedOut
from app.models.files import FileOut
from app.models.groups import GroupDB
from app.models.listeners import EventListenerDB, FeedListener
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_file_job
from app.routers.authentication import get_admin, get_admin_mode
from app.search.connect import check_search_result
from beanie import PydanticObjectId
from beanie.operators import Or, RegEx
from fastapi import APIRouter, Depends, HTTPException
from pika.adapters.blocking_connection import BlockingChannel

router = APIRouter()


# TODO: Move this to MongoDB middle layer
async def disassociate_listener_db(
    feed_id: str, listener_id: str, allows: bool = Depends(FeedAuthorization())
):
    """Remove a specific Event Listener from a feed. Does not delete either resource, just removes relationship.

    This actually performs the database operations, and can be used by any endpoints that need this functionality.
    """
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        new_listeners = []
        for feed_listener in feed.listeners:
            if feed_listener.listener_id != PydanticObjectId(listener_id):
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
            if (
                listener_info.access is not None
                and not user.admin
                and not user.admin_mode
            ):
                dataset_id = file_out.dataset_id
                user_id = user.email
                group_q = await GroupDB.find(
                    Or(GroupDB.creator == user_id, GroupDB.users.email == user_id),
                ).to_list()
                user_groups = [g.id for g in group_q]

                valid_submission = (
                    (listener_info.access.owner == user_id)
                    or (user.email in listener_info.access.users)
                    or (dataset_id in listener_info.access.datasets)
                    or (not set(user_groups).isdisjoint(listener_info.access.groups))
                )
                if not valid_submission:
                    continue
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


@router.put("/{feed_id}", response_model=FeedOut)
async def edit_feed(
    feed_id: str,
    feed_in: FeedIn,
    user=Depends(get_current_username),
    allow: bool = Depends(FeedAuthorization()),
):
    """Update the information about an existing Feed..

    Arguments:
        feed_id -- UUID of the feed to be udpated
        feed_in -- JSON object including updated information
    """
    feed = await FeedDB.get(PydanticObjectId(feed_id))
    if feed:
        # TODO: Refactor this with permissions checks etc.
        feed_update = feed_in.dict()
        if (
            not feed_update["name"]
            or not feed_update["search"]
            or len(feed_update["listeners"]) == 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Feed name/search/listeners can't be null or empty",
            )
            return
        feed.description = feed_update["description"]
        feed.name = feed_update["name"]
        feed.search = feed_update["search"]
        feed.listeners = feed_update["listeners"]
        try:
            await feed.save()
            return feed.dict()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
    raise HTTPException(status_code=404, detail=f"listener {feed_id} not found")


@router.get("", response_model=Paged)
async def get_feeds(
    searchTerm: Optional[str] = None,
    user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 10,
    admin=Depends(get_admin),
    admin_mode=Depends(get_admin_mode),
):
    """Fetch all existing Feeds."""
    criteria_list = []
    if not admin or not admin_mode:
        criteria_list.append(FeedDB.creator == user.email)
    if searchTerm is not None:
        criteria_list.append(
            Or(
                RegEx(field=FeedDB.name, pattern=searchTerm, options="i"),
                RegEx(field=FeedDB.description, pattern=searchTerm, options="i"),
            )
        )

    feeds_and_count = (
        await FeedDB.find(
            *criteria_list,
        )
        .aggregate(
            [_get_page_query(skip, limit, sort_field="created", ascending=False)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(feeds_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            FeedOut(id=item.pop("_id"), **item) for item in feeds_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/{feed_id}", response_model=FeedOut)
async def get_feed(
    feed_id: str,
    user=Depends(get_current_user),
    allow: bool = Depends(FeedAuthorization()),
):
    """Fetch an existing saved search Feed."""
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        return feed.dict()
    else:
        raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.delete("/{feed_id}", response_model=FeedOut)
async def delete_feed(
    feed_id: str,
    user=Depends(get_current_user),
    allow: bool = Depends(FeedAuthorization()),
):
    """Delete an existing saved search Feed."""
    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        await feed.delete()
        return feed.dict()
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")


@router.post("/{feed_id}/listeners", response_model=FeedOut)
async def associate_listener(
    feed_id: str,
    listener: FeedListener,
    username=Depends(get_current_username),
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode=Depends(get_admin_mode),
    allow: bool = Depends(FeedAuthorization()),
):
    """Associate an existing Event Listener with a Feed, e.g. so it will be triggered on new Feed results.

    Arguments:
        feed_id: Feed that should have new Event Listener associated
        listener: JSON object with "listener_id" field and "automatic" bool field (whether to auto-trigger on new data)
    """
    # Because we have FeedListener rather than listener_id here, we can't use injection for this
    allow = ListenerAuthorization().__call__(
        listener.listener_id, username, admin_mode, admin
    )
    if not allow:
        raise HTTPException(
            status_code=403,
            detail=f"User `{username} does not have permission on listener `{listener.listener_id}`",
        )

    if (feed := await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        if (
            await EventListenerDB.get(PydanticObjectId(listener.listener_id))
        ) is not None:
            feed.listeners.append(listener)
            await feed.save()
            return feed.dict()
        raise HTTPException(
            status_code=404, detail=f"Listener {listener.listener_id} not found"
        )
    raise HTTPException(status_code=404, detail=f"feed {feed_id} not found")


@router.delete("/{feed_id}/listeners/{listener_id}")
async def disassociate_listener(
    feed_id: str, listener_id: str, allow: bool = Depends(ListenerAuthorization())
):
    """Disassociate an Event Listener from a Feed.

    Arguments:
        feed_id: UUID of search Feed that is being changed
        listener_id: UUID of Event Listener that should be disassociated
    """
    if (await FeedDB.get(PydanticObjectId(feed_id))) is not None:
        if (await EventListenerDB.get(PydanticObjectId(listener_id))) is not None:
            await disassociate_listener_db(feed_id, listener_id)
            return {"disassociated": listener_id}
        raise HTTPException(status_code=404, detail=f"Listener {listener_id} not found")
    raise HTTPException(status_code=404, detail=f"Feed {feed_id} not found")
