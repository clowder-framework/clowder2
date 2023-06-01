from typing import Optional, List

from bson import ObjectId
from elasticsearch import Elasticsearch
from pymongo import MongoClient

from app.models.authorization import AuthorizationOut
from app.models.datasets import DatasetOut
from app.models.files import FileOut
from app.models.metadata import MetadataOut
from app.models.search import ESFileEntry, ESDatasetEntry, ESMetadataEntry
from app.search.connect import insert_record, update_record


async def index_dataset(
    db: MongoClient,
    es: Elasticsearch,
    dataset: DatasetOut,
    user_ids: Optional[List[str]] = None,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the dataset. user_ids is the list of users
    with permission to at least view the dataset, it will be queried if not provided."""
    if user_ids is None:
        # Get authorized users from db
        authorized_user_ids = []
        async for auth_q in db["authorization"].find(
            {"dataset_id": ObjectId(dataset.id)}
        ):
            auth = AuthorizationOut.from_mongo(auth_q)
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Add en entry to the dataset index
    doc = ESDatasetEntry(
        name=dataset.name,
        description=dataset.description,
        creator=dataset.author.email,
        created=dataset.created,
        modified=dataset.modified,
        downloads=dataset.downloads,
        user_ids=authorized_user_ids,
    ).dict()
    if update:
        update_record(es, "dataset", {"doc": doc}, dataset.id)
    else:
        insert_record(es, "dataset", doc, dataset.id)


async def index_file(
    db: MongoClient,
    es: Elasticsearch,
    file: FileOut,
    user_ids: Optional[List[str]] = None,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the file. user_ids is the list of users
    with permission to at least view the file's dataset, it will be queried if not provided.
    """
    if user_ids is None:
        # Get authorized users from db
        authorized_user_ids = []
        async for auth_q in db["authorization"].find(
            {"dataset_id": ObjectId(file.dataset_id)}
        ):
            auth = AuthorizationOut.from_mongo(auth_q)
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Add en entry to the file index
    doc = ESFileEntry(
        name=file.name,
        creator=file.creator.email,
        created=file.created,
        downloads=file.downloads,
        dataset_id=str(file.dataset_id),
        folder_id=str(file.folder_id),
        bytes=file.bytes,
        content_type=file.content_type.content_type,
        content_type_main=file.content_type.main_type,
        user_ids=authorized_user_ids,
    ).dict()
    if update:
        update_record(es, "file", {"doc": doc}, file.id)
    else:
        insert_record(es, "file", doc, file.id)


async def index_dataset_metadata(
    db: MongoClient,
    es: Elasticsearch,
    dataset: DatasetOut,
    metadata: MetadataOut,
    user_ids: Optional[List[str]] = None,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the metadata attached to the dataset. user_ids is the list of users
    with permission to at least view the dataset, it will be queried if not provided."""
    if user_ids is None:
        # Get authorized users from db
        authorized_user_ids = []
        async for auth_q in db["authorization"].find(
            {"dataset_id": ObjectId(dataset.id)}
        ):
            auth = AuthorizationOut.from_mongo(auth_q)
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Add an entry to the metadata index
    doc = ESMetadataEntry(
        resource_id=str(dataset.id),
        resource_type="dataset",
        resource_created=dataset.created,
        resource_creator=dataset.author.email,
        created=metadata.created,
        creator=metadata.agent.creator.email,
        content=metadata.content,
        context_url=metadata.context_url,
        context=metadata.context,
        definition=metadata.definition,
        name=dataset.name,
        description=dataset.description,
        downloads=dataset.downloads,
        user_ids=authorized_user_ids,
    ).dict()
    if update:
        update_record(es, "metadata", {"doc": doc}, metadata.id)
    else:
        insert_record(es, "metadata", doc, metadata.id)


async def index_file_metadata(
    db: MongoClient,
    es: Elasticsearch,
    file: FileOut,
    metadata: MetadataOut,
    user_ids: Optional[List[str]] = None,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the metadata attached to the dataset. user_ids is the list of users
    with permission to at least view the dataset, it will be queried if not provided."""
    if user_ids is None:
        # Get authorized users from db
        authorized_user_ids = []
        async for auth_q in db["authorization"].find(
            {"dataset_id": ObjectId(file.dataset_id)}
        ):
            auth = AuthorizationOut.from_mongo(auth_q)
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Add an entry to the metadata index
    doc = ESMetadataEntry(
        resource_id=str(file.id),
        resource_type="dataset",
        resource_created=file.created,
        resource_creator=file.creator.email,
        created=metadata.created,
        creator=metadata.agent.creator.email,
        content=metadata.content,
        context_url=metadata.context_url,
        context=metadata.context,
        definition=metadata.definition,
        name=file.name,
        content_type=file.content_type.content_type,
        content_type_main=file.content_type.main_type,
        dataset_id=str(file.dataset_id),
        folder_id=str(file.folder_id) if file.folder_id is not None else None,
        bytes=file.bytes,
        downloads=file.downloads,
        user_ids=authorized_user_ids,
    ).dict()
    if update:
        update_record(es, "metadata", {"doc": doc}, metadata.id)
    else:
        insert_record(es, "metadata", doc, metadata.id)
