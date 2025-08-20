from typing import List, Optional, Union

from app.config import settings
from app.models.authorization import AuthorizationDB
from app.models.datasets import DatasetDB, DatasetOut
from app.models.files import FileDB, FileOut
from app.models.folders import FolderOut
from app.models.metadata import MetadataDB
from app.models.search import ElasticsearchEntry
from app.models.thumbnails import ThumbnailDB
from app.search.connect import delete_document_by_id, insert_record, update_record
from beanie import PydanticObjectId
from bson import ObjectId
from elasticsearch import Elasticsearch, NotFoundError
from fastapi import HTTPException


async def index_dataset(
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
        async for auth in AuthorizationDB.find(
            AuthorizationDB.dataset_id == PydanticObjectId(dataset.id)
        ):
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Get full metadata from db (granular updates possible but complicated)
    metadata = []
    async for md in MetadataDB.find(
        MetadataDB.resource.resource_id == PydanticObjectId(dataset.id)
    ):
        metadata.append(md.content)
    dataset_status = dataset.status
    # Add en entry to the dataset index
    doc = ElasticsearchEntry(
        resource_type="dataset",
        name=dataset.name,
        description=dataset.description,
        creator=dataset.creator.email,
        created=dataset.created,
        modified=dataset.modified,
        downloads=dataset.downloads,
        user_ids=authorized_user_ids,
        metadata=metadata,
        status=dataset_status,
    ).dict()

    if update:
        try:
            update_record(es, settings.elasticsearch_index, {"doc": doc}, dataset.id)
        except NotFoundError:
            insert_record(es, settings.elasticsearch_index, doc, dataset.id)
    else:
        insert_record(es, settings.elasticsearch_index, doc, dataset.id)


async def index_file(
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
        async for auth in AuthorizationDB.find(
            AuthorizationDB.dataset_id == PydanticObjectId(file.dataset_id)
        ):
            authorized_user_ids += auth.user_ids
    else:
        authorized_user_ids = user_ids

    # Get full metadata from db (granular updates possible but complicated)
    metadata = []
    async for md in MetadataDB.find(
        MetadataDB.resource.resource_id == PydanticObjectId(file.id)
    ):
        metadata.append(md.content)

    # Add en entry to the file index
    doc = ElasticsearchEntry(
        resource_type="file",
        name=file.name,
        creator=file.creator.email,
        created=file.created,
        downloads=file.downloads,
        user_ids=authorized_user_ids,
        content_type=file.content_type.content_type,
        content_type_main=file.content_type.main_type,
        dataset_id=str(file.dataset_id),
        folder_id=str(file.folder_id),
        bytes=file.bytes,
        metadata=metadata,
        status=file.status,
    ).dict()
    if update:
        try:
            update_record(es, settings.elasticsearch_index, {"doc": doc}, file.id)
        except NotFoundError:
            insert_record(es, settings.elasticsearch_index, doc, file.id)
    else:
        insert_record(es, settings.elasticsearch_index, doc, file.id)


async def index_dataset_files(es: Elasticsearch, dataset_id: str, update: bool = False):
    query = [
        FileDB.dataset_id == ObjectId(dataset_id),
    ]
    files = await FileDB.find(*query).to_list()
    for file in files:
        await index_file(es, FileOut(**file.dict()), update=update)


async def index_folder(
    es: Elasticsearch,
    folder: FolderOut,
    user_ids: Optional[List[str]] = None,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the folder."""
    # find dataset this folder belongs to
    if (
        dataset := await DatasetDB.find_one(
            DatasetDB.id == PydanticObjectId(folder.dataset_id)
        )
    ) is not None:
        downloads = dataset.downloads
        status = dataset.status
    else:
        raise HTTPException(
            status_code=404, detail="Orphan folder doesn't belong to any dataset."
        )

    doc = ElasticsearchEntry(
        resource_type="folder",
        name=folder.name,
        creator=folder.creator.email,
        created=folder.created,
        dataset_id=str(folder.dataset_id),
        folder_id=str(folder.id),
        downloads=downloads,
        status=status,
    ).dict()

    if update:
        try:
            update_record(es, settings.elasticsearch_index, {"doc": doc}, folder.id)
        except NotFoundError:
            insert_record(es, settings.elasticsearch_index, doc, folder.id)
    else:
        insert_record(es, settings.elasticsearch_index, doc, folder.id)


async def remove_folder_index(folderId: Union[str, ObjectId], es: Elasticsearch):
    delete_document_by_id(es, settings.elasticsearch_index, str(folderId))


async def index_thumbnail(
    es: Elasticsearch,
    thumbnail_id: str,
    file_id: str,
    dataset_id: str,
    update: bool = False,
):
    """Create or update an Elasticsearch entry for the file. user_ids is the list of users
    with permission to at least view the file's dataset, it will be queried if not provided.
    """
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        if (
            thumbnail := await ThumbnailDB.get(PydanticObjectId(thumbnail_id))
        ) is not None:
            # Get authorized users from db
            authorized_user_ids = []
            async for auth in AuthorizationDB.find(
                AuthorizationDB.dataset_id == PydanticObjectId(dataset_id)
            ):
                authorized_user_ids += auth.user_ids
            # Get full metadata from db (granular updates possible but complicated)
            metadata = []
            async for md in MetadataDB.find(
                MetadataDB.resource.resource_id == PydanticObjectId(file.id)
            ):
                metadata.append(md.content)
            # Add en entry to the file index
            doc = ElasticsearchEntry(
                resource_type="thumbnail",
                name=file.name,
                creator=thumbnail.creator.email,
                created=thumbnail.created,
                user_ids=authorized_user_ids,
                content_type=thumbnail.content_type.content_type,
                content_type_main=thumbnail.content_type.main_type,
                file_id=str(file.id),
                dataset_id=str(file.dataset_id),
                folder_id=str(file.folder_id),
                bytes=thumbnail.bytes,
                metadata=metadata,
                downloads=thumbnail.downloads,
            ).dict()
            if update:
                try:
                    update_record(
                        es, settings.elasticsearch_index, {"doc": doc}, file.id
                    )
                except NotFoundError:
                    insert_record(es, settings.elasticsearch_index, doc, file.id)
            else:
                insert_record(es, settings.elasticsearch_index, doc, file.id)
