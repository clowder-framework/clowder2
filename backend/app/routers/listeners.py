import datetime
import os
import random
import string
from typing import List, Optional

from app.config import settings
from app.deps.authorization_deps import ListenerAuthorization
from app.keycloak_auth import get_current_user, get_current_username, get_user
from app.models.config import ConfigEntryDB
from app.models.feeds import FeedDB, FeedListener
from app.models.groups import GroupDB
from app.models.listeners import (
    EventListenerDB,
    EventListenerIn,
    EventListenerOut,
    ExtractorInfo,
    LegacyEventListenerIn,
)
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.search import SearchCriteria
from app.models.users import UserOut
from app.routers.authentication import get_admin, get_admin_mode
from app.routers.feeds import disassociate_listener_db
from beanie import PydanticObjectId
from beanie.operators import In, Or, RegEx
from fastapi import APIRouter, Depends, HTTPException
from packaging import version

router = APIRouter()
legacy_router = APIRouter()  # for back-compatibilty with v1 extractors

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


async def _process_incoming_v1_extractor_info(
    extractor_name: str,
    extractor_id: str,
    process: dict,
    creator: Optional[UserOut] = None,
):
    """Return FeedDB object given v1 extractor info."""
    if "file" in process:
        # Create a MIME-based feed for this v1 extractor
        criteria_list = []
        for mime in process["file"]:
            main_type = mime.split("/")[0] if mime.find("/") > -1 else mime
            sub_type = mime.split("/")[1] if mime.find("/") > -1 else None
            if sub_type:
                if sub_type == "*":
                    # If a wildcard, just match on main type
                    criteria_list.append(
                        SearchCriteria(field="content_type_main", value=main_type)
                    )
                else:
                    # Otherwise match the whole string
                    criteria_list.append(
                        SearchCriteria(field="content_type", value=mime)
                    )
            else:
                criteria_list.append(SearchCriteria(field="content_type", value=mime))

        # TODO: Who should the author be for an auto-generated feed? Currently None.
        new_feed = FeedDB(
            name=extractor_name,
            search={
                "index_name": settings.elasticsearch_index,
                "criteria": criteria_list,
                "mode": "or",
            },
            listeners=[FeedListener(listener_id=extractor_id, automatic=True)],
        )
        if creator is not None:
            new_feed.creator = creator.email
        await new_feed.insert()
        return new_feed


async def _check_livelihood(
    listener: EventListenerDB, heartbeat_interval=settings.listener_heartbeat_interval
):
    if heartbeat_interval == 0:
        heartbeat_interval = settings.listener_heartbeat_interval

    if listener.lastAlive is None:
        return False

    now = datetime.datetime.utcnow()
    elapsed = now - listener.lastAlive
    if elapsed.total_seconds() > heartbeat_interval:
        return False
    else:
        return True


def _check_livelihood_query(heartbeat_interval=settings.listener_heartbeat_interval):
    """
    Return a MongoDB aggregation query to check the livelihood of a listener.
    This is needed due to the alive field being a computed field.
    When a user call the /listeners endpoint, the alive field will be computed with the current datetime
    and compared with heartbeat_interval.
    """
    if heartbeat_interval == 0:
        heartbeat_interval = settings.listener_heartbeat_interval

    # Perform aggregation queries that adds alive flag using the PyMongo syntax
    aggregated_query = {
        "$addFields": {
            "alive": {
                "$lt": [
                    {"$subtract": [datetime.datetime.utcnow(), "$lastAlive"]},
                    heartbeat_interval * 1000,  # convert to milliseconds
                ]
            }
        }
    }

    return aggregated_query


@router.get("/instance")
async def get_instance_id(
    user=Depends(get_current_user),
):
    instance_id = await ConfigEntryDB.find_one({ConfigEntryDB.key == "instance_id"})
    if instance_id:
        return instance_id.value
    else:
        # If no ID has been generated for this instance, generate a 10-digit alphanumeric identifier
        instance_id = "".join(
            random.choice(
                string.ascii_uppercase + string.ascii_lowercase + string.digits
            )
            for _ in range(10)
        )
        config_entry = ConfigEntryDB(key="instance_id", value=instance_id)
        await config_entry.insert()
        return config_entry


@router.post("", response_model=EventListenerOut)
async def save_listener(
    listener_in: EventListenerIn,
    user=Depends(get_current_user),
):
    """Register a new Event Listener with the system."""
    listener = EventListenerDB(**listener_in.dict(), creator=user)
    # TODO: Check for duplicates somehow?
    await listener.insert()
    return listener.dict()


@legacy_router.post("", response_model=EventListenerOut)
async def save_legacy_listener(
    legacy_in: LegacyEventListenerIn,
    user=Depends(get_current_user),
):
    """This will take a POST with Clowder v1 extractor_info included, and convert/update to a v2 Listener."""
    listener_properties = ExtractorInfo(**legacy_in.dict())
    listener = EventListenerDB(
        name=legacy_in.name,
        version=legacy_in.version,
        description=legacy_in.description,
        creator=user,
        properties=listener_properties,
    )

    # check to see if extractor already exists and update if so, otherwise return existing
    if (
        existing := await EventListenerDB.find_one(
            EventListenerDB.name == legacy_in.name
        )
    ) is not None:
        # if this is a new version, add it to the database, otherwise update existing
        if version.parse(listener.version) > version.parse(existing.version):
            listener.id = existing.id
            existing = EventListenerDB(*listener.dict())
            await existing.save()
            #  TODO: Should older extractor version entries be deleted?
            return existing.dict()
        else:
            # TODO: Should this fail the POST instead?
            return existing.dict()
    else:
        # Register new listener
        await listener.insert()
        # Assign a MIME-based listener if necessary
        if listener.properties and listener.properties.process:
            await _process_incoming_v1_extractor_info(
                legacy_in.name, listener.id, listener.properties.process, user
            )
        return listener.dict()


@router.get("/search", response_model=Paged)
async def search_listeners(
    text: str = "",
    skip: int = 0,
    limit: int = 2,
    heartbeat_interval: Optional[int] = settings.listener_heartbeat_interval,
    user_id=Depends(get_current_username),
    process: Optional[str] = None,
    dataset_id: Optional[str] = None,
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode=Depends(get_admin_mode),
):
    """Search all Event Listeners in the db based on text.

    Arguments:
        text -- any text matching name or description
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
    """
    # First compute alive flag for all listeners
    aggregation_pipeline = [
        _check_livelihood_query(heartbeat_interval=heartbeat_interval)
    ]

    # Add filters if applicable
    if process:
        if process == "file":
            aggregation_pipeline.append(
                {
                    "$match": {
                        "$or": [
                            {"properties.process.file": {"$exists": True}},
                            {"properties.process.file": {}},
                        ]
                    }
                }
            )
        if process == "dataset":
            aggregation_pipeline.append(
                {
                    "$match": {
                        "$or": [
                            {"properties.process.dataset": {"$exists": True}},
                            {"properties.process.dataset": {}},
                        ]
                    }
                }
            )
    if not admin or not admin_mode:
        aggregation_pipeline.append({"$match": {"active": True}})
    # Add pagination
    aggregation_pipeline.append(
        _get_page_query(skip, limit, sort_field="name", ascending=True)
    )

    criteria_list = [
        Or(
            RegEx(field=EventListenerDB.name, pattern=text, options="i"),
            RegEx(field=EventListenerDB.description, pattern=text, options="i"),
        )
    ]
    if not admin or not admin_mode:
        user_q = await GroupDB.find(
            Or(GroupDB.creator == user_id, GroupDB.users.email == user_id),
        ).to_list()
        user_groups = [u.id for u in user_q]

        if dataset_id is None:
            criteria_list.append(
                Or(
                    EventListenerDB.access is None,
                    EventListenerDB.access.owner == user_id,
                    EventListenerDB.access.users == user_id,
                    In(EventListenerDB.access.groups, user_groups),
                )
            )
        else:
            criteria_list.append(
                Or(
                    EventListenerDB.access is None,
                    EventListenerDB.access.owner == user_id,
                    EventListenerDB.access.users == user_id,
                    In(EventListenerDB.access.groups, user_groups),
                    EventListenerDB.access.datasets == PydanticObjectId(dataset_id),
                )
            )

    listeners_and_count = (
        await EventListenerDB.find(*criteria_list)
        .aggregate(aggregation_pipeline)
        .to_list()
    )
    page_metadata = _construct_page_metadata(listeners_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            EventListenerOut(id=item.pop("_id"), **item)
            for item in listeners_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.get("/categories", response_model=List[str])
async def list_categories(user=Depends(get_current_username)):
    """Get all the distinct categories of registered listeners in the db"""
    return await EventListenerDB.distinct(EventListenerDB.properties.categories)


@router.get("/defaultLabels", response_model=List[str])
async def list_default_labels(user=Depends(get_current_username)):
    """Get all the distinct default labels of registered listeners in the db"""
    return await EventListenerDB.distinct(EventListenerDB.properties.default_labels)


@router.get("/{listener_id}", response_model=EventListenerOut)
async def get_listener(
    listener_id: str,
    user=Depends(get_current_username),
    allow: bool = Depends(ListenerAuthorization()),
):
    """Return JSON information about an Event Listener if it exists."""
    if (
        listener := await EventListenerDB.get(PydanticObjectId(listener_id))
    ) is not None:
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.get("/{listener_id}/status", response_model=bool)
async def check_listener_livelihood(
    listener_id: str,
    heartbeat_interval: Optional[int] = settings.listener_heartbeat_interval,
    user=Depends(get_current_username),
    allow: bool = Depends(ListenerAuthorization()),
):
    """Return JSON information about an Event Listener if it exists."""
    if (
        listener := await EventListenerDB.get(PydanticObjectId(listener_id))
    ) is not None:
        return await _check_livelihood(listener, heartbeat_interval)
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.get("", response_model=Paged)
async def get_listeners(
    user_id=Depends(get_current_username),
    skip: int = 0,
    limit: int = 2,
    heartbeat_interval: Optional[int] = settings.listener_heartbeat_interval,
    category: Optional[str] = None,
    label: Optional[str] = None,
    alive_only: Optional[bool] = False,
    process: Optional[str] = None,
    dataset_id: Optional[str] = None,
    all: Optional[bool] = False,
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode=Depends(get_admin_mode),
):
    """Get a list of all Event Listeners in the db.

    Arguments:
        skip -- number of initial records to skip (i.e. for pagination)
        limit -- restrict number of records to be returned (i.e. for pagination)
        heartbeat_interval -- number of seconds after which a listener is considered dead
        category -- filter by category has to be exact match
        label -- filter by label has to be exact match
        alive_only -- filter by alive status
        process -- filter by file or dataset type (if specified)
        dataset_id -- restrict to listeners that run on the given dataset or a file within (if not otherwise permitted)
        all -- boolean stating if we want to show all listeners irrespective of admin and admin_mode
    """
    # First compute alive flag for all listeners
    aggregation_pipeline = [
        _check_livelihood_query(heartbeat_interval=heartbeat_interval)
    ]

    # Add filters if applicable
    if category:
        aggregation_pipeline.append({"$match": {"properties.categories": category}})
    if label:
        aggregation_pipeline.append({"$match": {"properties.default_labels": label}})
    if alive_only:
        (aggregation_pipeline.append({"$match": {"alive": True}}),)
    if process:
        if process == "file":
            aggregation_pipeline.append(
                {
                    "$match": {
                        "$or": [
                            {"properties.process.file": {"$exists": True}},
                            {"properties.process": {}},
                        ]
                    }
                }
            )
        if process == "dataset":
            aggregation_pipeline.append(
                {
                    "$match": {
                        "$or": [
                            {"properties.process.dataset": {"$exists": True}},
                            {"properties.process": {}},
                        ]
                    }
                }
            )
    # Non admin users can access only active listeners unless all is turned on for Extractor page
    if not all and (not admin or not admin_mode):
        aggregation_pipeline.append({"$match": {"active": True}})
    # Add pagination
    aggregation_pipeline.append(
        _get_page_query(skip, limit, sort_field="name", ascending=True)
    )

    # Filter by ownership
    criteria_list = []
    if not admin or not admin_mode:
        user_q = await GroupDB.find(
            Or(GroupDB.creator == user_id, GroupDB.users.user.email == user_id),
        ).to_list()
        user_groups = [u.id for u in user_q]

        if dataset_id is None:
            criteria_list.append(
                Or(
                    EventListenerDB.access is None,
                    EventListenerDB.access.owner == user_id,
                    EventListenerDB.access.users == user_id,
                    In(EventListenerDB.access.groups, user_groups),
                )
            )
        else:
            criteria_list.append(
                Or(
                    EventListenerDB.access is None,
                    EventListenerDB.access.owner == user_id,
                    EventListenerDB.access.users == user_id,
                    In(EventListenerDB.access.groups, user_groups),
                    EventListenerDB.access.datasets == PydanticObjectId(dataset_id),
                )
            )

    # Run aggregate query and return
    # Sort by name alphabetically
    try:
        listeners_and_count = (
            await EventListenerDB.find(*criteria_list)
            .aggregate(aggregation_pipeline)
            .to_list()
        )
    except Exception as e:
        print(e)
    page_metadata = _construct_page_metadata(listeners_and_count, skip, limit)
    page = Paged(
        metadata=page_metadata,
        data=[
            EventListenerOut(id=item.pop("_id"), **item)
            for item in listeners_and_count[0]["data"]
        ],
    )
    return page.dict()


@router.put("/{listener_id}", response_model=EventListenerOut)
async def edit_listener(
    listener_id: str,
    listener_in: EventListenerIn,
    allow: bool = Depends(ListenerAuthorization()),
):
    """Update the information about an existing Event Listener..

    Arguments:
        listener_id -- UUID of the listener to be udpated
        listener_in -- JSON object including updated information
    """
    if (
        listener := await EventListenerDB.get(PydanticObjectId(listener_id))
    ) is not None:
        listener_update = dict(listener_in) if listener_in is not None else {}
        listener_update["modified"] = datetime.datetime.utcnow()
        try:
            listener.update(listener_update)
            await listener.save()
            return listener.dict()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.put("/{listener_id}/enable", response_model=EventListenerOut)
async def enable_listener(
    listener_id: str,
    allow: bool = Depends(ListenerAuthorization()),
):
    """Enable an Event Listener. Only admins can enable listeners.

    Arguments:
        listener_id -- UUID of the listener to be enabled
    """
    return await _set_active_flag(listener_id, True)


@router.put("/{listener_id}/disable", response_model=EventListenerOut)
async def disable_listener(
    listener_id: str,
    user_id=Depends(get_user),
    allow: bool = Depends(ListenerAuthorization()),
):
    """Disable an Event Listener. Only admins can enable listeners.

    Arguments:
        listener_id -- UUID of the listener to be enabled
    """
    return await _set_active_flag(listener_id, False)


async def _set_active_flag(
    listener_id: str,
    active: bool,
    allow: bool = Depends(ListenerAuthorization()),
):
    """Set the active flag of an Event Listener. Only admins can enable/disable listeners.

    Arguments:
        listener_id -- UUID of the listener to be enabled/disabled
    """
    listener = await EventListenerDB.find_one(
        EventListenerDB.id == PydanticObjectId(listener_id)
    )
    if listener:
        try:
            listener.active = active
            await listener.save()
            return listener.dict()
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}")
async def delete_listener(
    listener_id: str,
    allow: bool = Depends(ListenerAuthorization()),
):
    """Remove an Event Listener from the database. Will not clear event history for the listener."""
    if (
        listener := await EventListenerDB.get(PydanticObjectId(listener_id))
    ) is not None:
        # unsubscribe the listener from any feeds
        async for feed in FeedDB.find(
            FeedDB.listeners.listener_id == PydanticObjectId(listener_id)
        ):
            await disassociate_listener_db(feed.id, listener_id)
        await listener.delete()
        return {"deleted": listener_id}
    raise HTTPException(status_code=404, detail=f"Listener {listener_id} not found")


@router.post("/{listener_id}/users/{target_user}")
async def add_user_permission(
    listener_id: str,
    target_user: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if target_user not in listener.access.users:
            listener.access.users.append(target_user)
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}/users/{target_user}")
async def remove_user_permission(
    listener_id: str,
    target_user: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if target_user in listener.access.users:
            listener.access.users.remove(target_user)
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.post("/{listener_id}/groups/{target_group}")
async def add_group_permission(
    listener_id: str,
    target_group: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if PydanticObjectId(target_group) not in listener.access.groups:
            listener.access.groups.append(PydanticObjectId(target_group))
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}/groups/{target_group}")
async def remove_group_permission(
    listener_id: str,
    target_group: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if PydanticObjectId(target_group) in listener.access.groups:
            listener.access.groups.remove(PydanticObjectId(target_group))
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.post("/{listener_id}/datasets/{target_dataset}")
async def add_dataset_permission(
    listener_id: str,
    target_dataset: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if PydanticObjectId(target_dataset) not in listener.access.datasets:
            listener.access.datasets.append(PydanticObjectId(target_dataset))
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")


@router.delete("/{listener_id}/datasets/{target_dataset}")
async def remove_dataset_permission(
    listener_id: str,
    target_dataset: str,
    user_id=Depends(get_current_username),
    admin_mode: bool = Depends(get_admin_mode),
    admin=Depends(get_admin),
):
    listener = await EventListenerDB.get(PydanticObjectId(listener_id))
    if listener is not None:
        if listener.access is None:
            raise HTTPException(
                status_code=403,
                detail=f"listener {listener_id} does not require private access",
            )
        elif listener.access.owner != user_id and not (admin or admin_mode):
            raise HTTPException(
                status_code=403,
                detail=f"please contact {listener.access.owner} to modify access",
            )
        if PydanticObjectId(target_dataset) in listener.access.datasets:
            listener.access.datasets.remove(PydanticObjectId(target_dataset))
            await listener.save()
        return listener.dict()
    raise HTTPException(status_code=404, detail=f"listener {listener_id} not found")
