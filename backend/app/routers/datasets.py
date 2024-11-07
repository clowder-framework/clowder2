import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Iterable, Mapping
from typing import List, Optional

from app import dependencies
from app.config import settings
from app.db.dataset.download import _increment_data_downloads
from app.db.dataset.version import (
    _delete_frozen_dataset,
    _delete_thumbnail,
    _delete_visualizations,
    _freeze_dataset_metadata,
    _freeze_dataset_thumbnail,
    _freeze_dataset_visualization,
    _freeze_files_folders_w_metadata_vis,
    remove_file_entry,
)
from app.db.folder.hierarchy import _get_folder_hierarchy
from app.deps.authorization_deps import Authorization, CheckStatus
from app.keycloak_auth import get_current_user, get_token, get_user
from app.models.authorization import AuthorizationDB, RoleType
from app.models.datasets import (
    DatasetBase,
    DatasetDB,
    DatasetDBViewList,
    DatasetFreezeDB,
    DatasetFreezeOut,
    DatasetIn,
    DatasetOut,
    DatasetPatch,
    DatasetStatus,
)
from app.models.files import FileDB, FileDBViewList, FileOut, LocalFileIn, StorageType
from app.models.folder_and_file import FolderFileViewList
from app.models.folders import (
    FolderDB,
    FolderDBViewList,
    FolderIn,
    FolderOut,
    FolderPatch,
)
from app.models.licenses import standard_licenses
from app.models.metadata import MetadataDB
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.models.thumbnails import ThumbnailDB
from app.models.users import UserOut
from app.rabbitmq.listeners import submit_dataset_job
from app.routers.authentication import get_admin, get_admin_mode
from app.routers.files import add_file_entry, add_local_file_entry
from app.routers.licenses import delete_license
from app.search.connect import delete_document_by_id
from app.search.index import (
    index_dataset,
    index_file,
    index_folder,
    remove_folder_index,
)
from beanie import PydanticObjectId
from beanie.operators import And, Or
from bson import json_util
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from pymongo import DESCENDING
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate
from starlette.concurrency import run_in_threadpool

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


def _describe_zip_contents(file_list: list):
    """Traverse a list of zipfile entries and create a dictionary structure like so:
    {
        ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'root', 'files'],
        "folder_1": {
            ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'folder_1', 'files']
        },
        "folder_2": {
            ""__CLOWDER_FILE_LIST__"": ['list', 'of', 'folder_2', 'files'],
            "subfolder_3": {
                ""__CLOWDER_FILE_LIST__"": ['list', 'of', subfolder_3', 'files']
            },
        },
        ...
    }
    """
    empty_entry = {"__CLOWDER_FILE_LIST__": []}

    def path_parts_to_dict(entries, last_is_file=True):
        if len(entries) == 1:
            if last_is_file:
                return {"__CLOWDER_FILE_LIST__": [entries[0]]}
            else:
                return {entries[0]: empty_entry.copy()}
        else:
            return {entries[0]: path_parts_to_dict(entries[1:])}

    def nested_update(target_dict, update_dict):
        for k, v in update_dict.items():
            if isinstance(v, Mapping):
                current = target_dict[k] if k in target_dict else {}
                target_dict[k] = nested_update(current, v)
            elif isinstance(v, Iterable):
                current = target_dict[k] if k in target_dict else []
                if v not in current:
                    target_dict[k] = list(set(current + v))
            else:
                target_dict[k] = v
        return target_dict

    zip_structure = empty_entry.copy()
    for entry in file_list:
        if "__MACOSX" in entry or entry.endswith(".DS_Store"):
            # TODO: These are not visible in OSX 10.3+ and hard to delete. Leaving this in to minimize user frustration.
            continue
        if entry.endswith(os.path.sep):
            # this is a folder, not a file
            folder_parts = os.path.normpath(entry).split(os.path.sep)
            if len(folder_parts) > 1:
                folder_dict = path_parts_to_dict(folder_parts, False)
                zip_structure = nested_update(zip_structure, folder_dict)
            elif entry not in zip_structure:
                zip_structure[entry.rstrip(os.path.sep)] = empty_entry.copy()
            continue

        parts = os.path.normpath(entry).split(os.path.sep)
        if len(parts) > 1:
            parts_dict = path_parts_to_dict(parts)
            zip_structure = nested_update(zip_structure, parts_dict)
        else:
            zip_structure["__CLOWDER_FILE_LIST__"].append(entry)

    return zip_structure


async def _create_folder_structure(
    dataset_id: str,
    contents: dict,
    folder_path: str,
    folder_lookup: dict,
    user: UserOut,
    parent_folder_id: Optional[str] = None,
):
    """Recursively create folders encountered in folder_path until the target folder is created.
    Arguments:
        - dataset_id: destination dataset
        - contents: list of contents in folder (see _describe_zip_contents() for structure)
        - folder_path: full path to folder from dataset root (e.g. folder/subfolder/subfolder2)
        - folder_lookup: mapping from folder_path to folder_id for reference later
        - parent_folder_id: destination folder
    """
    for k, v in contents.items():
        if k == "__CLOWDER_FILE_LIST__":
            continue

        # Create the folder
        folder_dict = {
            "dataset_id": dataset_id,
            "name": k,
            "parent_folder": parent_folder_id,
        }
        folder_db = FolderDB(**folder_dict, creator=user)
        await folder_db.insert()

        # Store ID and call recursively on child folders
        new_folder_path = folder_path + os.path.sep + k
        folder_lookup[new_folder_path] = folder_db.id
        if isinstance(v, Mapping):
            folder_lookup = await _create_folder_structure(
                dataset_id, v, new_folder_path, folder_lookup, user, folder_db.id
            )

    return folder_lookup


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    license_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
):
    standard_license = False
    standard_license_ids = [license.id for license in standard_licenses]
    if license_id in standard_license_ids:
        standard_license = True

    dataset = DatasetDB(
        **dataset_in.dict(),
        creator=user,
        license_id=str(license_id),
        standard_license=standard_license,
    )
    await dataset.insert()

    # Create authorization entry
    await AuthorizationDB(
        dataset_id=dataset.id,
        role=RoleType.OWNER,
        creator=user.email,
    ).save()

    # Add new entry to elasticsearch
    await index_dataset(es, DatasetOut(**dataset.dict()), [user.email])
    return dataset.dict()


@router.get("", response_model=Paged)
async def get_datasets(
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
):
    query = [DatasetDBViewList.frozen == False]  # noqa: E712

    if admin and admin_mode and not mine:
        datasets_and_count = (
            await DatasetDBViewList.find(*query)
            .aggregate(
                [_get_page_query(skip, limit, sort_field="created", ascending=False)],
            )
            .to_list()
        )
    elif mine:
        query.append(DatasetDBViewList.creator.email == user_id)
        datasets_and_count = (
            await DatasetDBViewList.find(*query)
            .aggregate(
                [_get_page_query(skip, limit, sort_field="created", ascending=False)],
            )
            .to_list()
        )
    else:
        query.append(
            Or(
                DatasetDBViewList.creator.email == user_id,
                DatasetDBViewList.auth.user_ids == user_id,
                DatasetDBViewList.status == DatasetStatus.PUBLIC.name,
                DatasetDBViewList.status == DatasetStatus.AUTHENTICATED.name,
            )
        )
        datasets_and_count = (
            await DatasetDBViewList.find(*query)
            .aggregate(
                [_get_page_query(skip, limit, sort_field="created", ascending=False)],
            )
            .to_list()
        )

    page_metadata = _construct_page_metadata(datasets_and_count, skip, limit)
    # TODO have to change _id this way otherwise it won't work
    # TODO need to research if there is other pydantic trick to make it work

    page = Paged(
        metadata=page_metadata,
        data=[
            DatasetOut(id=item.pop("_id"), **item)
            for item in datasets_and_count[0]["data"]
        ],
    )

    return page.dict()


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(
    dataset_id: str,
    authenticated: bool = Depends(CheckStatus("AUTHENTICATED")),
    public: bool = Depends(CheckStatus("PUBLIC")),
    allow: bool = Depends(Authorization("viewer")),
):
    if authenticated or public or allow:
        if (
            dataset := await DatasetDBViewList.find_one(
                Or(
                    DatasetDBViewList.id == PydanticObjectId(dataset_id),
                )
            )
        ) is not None:
            return dataset.dict()
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files", response_model=Paged)
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    authenticated: bool = Depends(CheckStatus("AUTHENTICATED")),
    public: bool = Depends(CheckStatus("PUBLIC")),
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(Authorization("viewer")),
):
    if (
        await DatasetDBViewList.find_one(
            Or(
                DatasetDBViewList.id == PydanticObjectId(dataset_id),
            )
        )
    ) is not None:
        if authenticated or public or (admin and admin_mode):
            query = [
                FileDBViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
        else:
            query = [
                FileDBViewList.dataset_id == PydanticObjectId(dataset_id),
                Or(
                    FileDBViewList.creator.email == user_id,
                    FileDBViewList.auth.user_ids == user_id,
                ),
            ]
        if folder_id is not None:
            query.append(FileDBViewList.folder_id == PydanticObjectId(folder_id))

        files_and_count = (
            await FileDBViewList.find(*query)
            .aggregate(
                [_get_page_query(skip, limit, sort_field="created", ascending=False)],
            )
            .to_list()
        )
        page_metadata = _construct_page_metadata(files_and_count, skip, limit)
        page = Paged(
            metadata=page_metadata,
            data=[
                FileOut(id=item.pop("_id"), **item)
                for item in files_and_count[0]["data"]
            ],
        )
        return page.dict()

    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.put("/{dataset_id}", response_model=DatasetOut)
async def edit_dataset(
    dataset_id: str,
    dataset_info: DatasetBase,
    user=Depends(get_current_user),
    es=Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # TODO: Refactor this with permissions checks etc.
        dataset.update(dataset_info)
        dataset.modified = datetime.datetime.utcnow()
        await dataset.save()

        # Update entry to the dataset index
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)

        # Update folders index since its using dataset downloads and status to index
        async for folder in FolderDB.find(
            FolderDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            await index_folder(es, FolderOut(**folder.dict()), update=True)

        return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}", response_model=DatasetOut)
async def patch_dataset(
    dataset_id: str,
    dataset_info: DatasetPatch,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # TODO: Update method not working properly
        if dataset_info.name is not None:
            dataset.name = dataset_info.name
        if dataset_info.description is not None:
            dataset.description = dataset_info.description
        if dataset_info.status is not None:
            dataset.status = dataset_info.status
        dataset.modified = datetime.datetime.utcnow()
        await dataset.save()

        if dataset_info.status is not None:
            query = [
                FileDBViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
            files_views = await FileDBViewList.find(*query).to_list()
            for file_view in files_views:
                if (
                    file := await FileDB.get(PydanticObjectId(file_view.id))
                ) is not None:
                    file.status = dataset_info.status
                    await file.save()
                    await index_file(es, FileOut(**file.dict()), update=True)

        # Update entry to the dataset index
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)

        # Update folders index since its using dataset downloads and status to index
        async for folder in FolderDB.find(
            FolderDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            await index_folder(es, FolderOut(**folder.dict()), update=True)

        return dataset.dict()


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        # delete from elasticsearch
        delete_document_by_id(es, settings.elasticsearch_index, dataset_id)

        # find associate frozen datasets and delete them iteratively
        async for frozen_dataset in DatasetFreezeDB.find(
            DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id)
        ):
            await _delete_frozen_dataset(frozen_dataset, fs, hard_delete=True)

        # delete associate metadata
        await MetadataDB.find(
            MetadataDB.resource.resource_id == PydanticObjectId(dataset_id),
            MetadataDB.resource.collection == "datasets",
        ).delete()

        # delete associate folders
        await FolderDB.find(
            FolderDB.dataset_id == PydanticObjectId(dataset_id)
        ).delete()

        # delete associate thumbnails
        await _delete_thumbnail(dataset, fs)

        # delete associate visualizations
        await _delete_visualizations(dataset, fs)

        # delete files and its associate resources
        async for file in FileDB.find(
            FileDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            await remove_file_entry(file.id, fs, es)

        await AuthorizationDB.find(
            AuthorizationDB.dataset_id == PydanticObjectId(dataset_id)
        ).delete()

        # don't delete standard license
        standard_license_ids = [license.id for license in standard_licenses]
        if dataset.license_id not in standard_license_ids:
            await delete_license(dataset.license_id)

        # if above succeeded, delete the dataset
        await dataset.delete()
        return {"deleted": dataset_id}

    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/freeze", response_model=DatasetFreezeOut)
async def freeze_dataset(
    dataset_id: str,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization(RoleType.OWNER)),
):
    # Retrieve the dataset by ID
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        frozen_dataset_data = dataset.dict()

        # Copy the dataset to Public Freeze Dataset collection
        # else search in freeze dataset collection to get the latest version of the dataset
        latest_frozen_dataset = (
            await DatasetFreezeDB.find(
                DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id)
            )
            .sort(("frozen_version_num", DESCENDING))
            .first_or_none()
        )

        frozen_dataset_data["origin_id"] = frozen_dataset_data.pop("id")

        if latest_frozen_dataset is None:
            # if no origin id associated with that dataset, freeze it as the very fist version
            frozen_dataset_data["frozen_version_num"] = 1
        else:
            frozen_dataset_data["frozen_version_num"] = (
                latest_frozen_dataset.frozen_version_num + 1
            )

        # start freezing associate information
        frozen_dataset_data["frozen"] = True

        # if dataset has thumbnail
        if dataset.thumbnail_id is not None:
            frozen_dataset_thumbnail_id = await _freeze_dataset_thumbnail(
                dataset.thumbnail_id
            )
            frozen_dataset_data["thumbnail_id"] = frozen_dataset_thumbnail_id

        frozen_dataset = DatasetFreezeDB(**frozen_dataset_data)
        await frozen_dataset.insert()

        # dataset metadata
        await _freeze_dataset_metadata(dataset_id, frozen_dataset.id)

        # dataset visualization
        await _freeze_dataset_visualization(dataset_id, frozen_dataset.id)

        # recursively freeze both files, folders, and associate metadata, visualization (if any)
        await _freeze_files_folders_w_metadata_vis(dataset_id, frozen_dataset.id)

        # Create authorization entry
        await AuthorizationDB(
            dataset_id=frozen_dataset.id,
            role=RoleType.OWNER,
            creator=user.email,
        ).save()

        # TODO thumbnails, visualizations

        return frozen_dataset.dict()

    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/freeze", response_model=Paged)
async def get_freeze_datasets(
    dataset_id: str,
    skip: int = 0,
    limit: int = 10,
    user=Depends(get_current_user),
    authenticated: bool = Depends(CheckStatus("AUTHENTICATED")),
    public: bool = Depends(CheckStatus("PUBLIC")),
    admin=Depends(get_admin),
    admin_mode: bool = Depends(get_admin_mode),
    viewer: bool = Depends(Authorization("viewer")),
):
    if authenticated or public or (admin and admin_mode) or viewer:
        frozen_datasets_and_count = (
            await DatasetFreezeDB.find(
                DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id)
            )
            .aggregate(
                [
                    _get_page_query(
                        skip, limit, sort_field="frozen_version_num", ascending=False
                    )
                ],
            )
            .to_list()
        )

        page_metadata = _construct_page_metadata(frozen_datasets_and_count, skip, limit)
        page = Paged(
            metadata=page_metadata,
            data=[
                DatasetFreezeOut(id=item.pop("_id"), **item)
                for item in frozen_datasets_and_count[0]["data"]
            ],
        )
        return page.dict()
    else:
        raise HTTPException(
            status_code=403,
            detail=f"User {user} does not have access to view freeze list for dataset {dataset_id}",
        )


@router.get("/{dataset_id}/freeze/latest_version_num", response_model=int)
async def get_freeze_dataset_lastest_version_num(
    dataset_id: str,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("owner")),
):
    freeze_dataset_latest_version_num = -999
    latest_frozen_dataset = (
        await DatasetFreezeDB.find(
            DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id)
        )
        .sort(("frozen_version_num", DESCENDING))
        .first_or_none()
    )
    if latest_frozen_dataset is not None:
        freeze_dataset_latest_version_num = latest_frozen_dataset.frozen_version_num

    return freeze_dataset_latest_version_num


@router.get(
    "/{dataset_id}/freeze/{frozen_version_num}", response_model=DatasetFreezeOut
)
async def get_freeze_dataset_version(
    dataset_id: str,
    frozen_version_num: int,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("owner")),
):
    # Retrieve the dataset by ID
    if (
        frozen_dataset := await DatasetFreezeDB.find_one(
            DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id),
            DatasetFreezeDB.frozen_version_num == frozen_version_num,
        )
    ) is not None:
        if frozen_dataset.deleted is True:
            raise HTTPException(
                status_code=404,
                detail=f"Dataset {dataset_id} version {frozen_version_num} has been deleted",
            )

        return frozen_dataset.dict()

    raise HTTPException(
        status_code=404,
        detail=f"Dataset {dataset_id} version {frozen_version_num} not found",
    )


@router.delete(
    "/{dataset_id}/freeze/{frozen_version_num}", response_model=DatasetFreezeOut
)
async def delete_freeze_dataset_version(
    dataset_id: str,
    frozen_version_num: int,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("owner")),
):
    # Retrieve the frozen dataset by ID
    if (
        frozen_dataset := await DatasetFreezeDB.find_one(
            DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id),
            DatasetFreezeDB.frozen_version_num == frozen_version_num,
        )
    ) is not None:
        return await _delete_frozen_dataset(frozen_dataset, fs, hard_delete=False)

    raise HTTPException(
        status_code=404,
        detail=f"Dataset {dataset_id} version {frozen_version_num} not found",
    )


@router.post("/{dataset_id}/folders", response_model=FolderOut)
async def add_folder(
    dataset_id: str,
    folder_in: FolderIn,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("uploader")),
):
    if (await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        parent_folder = folder_in.parent_folder
        if parent_folder is not None:
            if (await FolderDB.get(PydanticObjectId(parent_folder))) is None:
                raise HTTPException(
                    status_code=400, detail=f"Parent folder {parent_folder} not found"
                )
        new_folder = FolderDB(
            **folder_in.dict(), creator=user, dataset_id=PydanticObjectId(dataset_id)
        )
        await new_folder.insert()
        await index_folder(es, FolderOut(**new_folder.dict()))
        return new_folder.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders", response_model=Paged)
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    user_id=Depends(get_user),
    authenticated: bool = Depends(CheckStatus("authenticated")),
    public: bool = Depends(CheckStatus("PUBLIC")),
    skip: int = 0,
    limit: int = 10,
    allow: bool = Depends(Authorization("viewer")),
):
    if (
        await DatasetDBViewList.find_one(
            Or(
                DatasetDBViewList.id == PydanticObjectId(dataset_id),
            )
        )
    ) is not None:
        if authenticated or public:
            query = [
                FolderDBViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
        else:
            query = [
                FolderDBViewList.dataset_id == PydanticObjectId(dataset_id),
                Or(
                    FolderDBViewList.creator.email == user_id,
                    FolderDBViewList.auth.user_ids == user_id,
                ),
            ]
        if parent_folder is not None:
            query.append(
                FolderDBViewList.parent_folder == PydanticObjectId(parent_folder)
            )
        else:
            query.append(FolderDBViewList.parent_folder == None)  # noqa: E711

        folders_and_count = (
            await FolderDBViewList.find(*query)
            .aggregate(
                [_get_page_query(skip, limit, sort_field="created", ascending=False)],
            )
            .to_list()
        )

        page_metadata = _construct_page_metadata(folders_and_count, skip, limit)
        page = Paged(
            metadata=page_metadata,
            data=[
                DatasetOut(id=item.pop("_id"), **item)
                for item in folders_and_count[0]["data"]
            ],
        )
        return page.dict()
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders_and_files", response_model=Paged)
async def get_dataset_folders_and_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    authenticated: bool = Depends(CheckStatus("AUTHENTICATED")),
    public: bool = Depends(CheckStatus("PUBLIC")),
    user_id=Depends(get_user),
    skip: int = 0,
    limit: int = 10,
    admin=Depends(get_admin),
    enable_admin: bool = False,
    admin_mode: bool = Depends(get_admin_mode),
    allow: bool = Depends(Authorization("viewer")),
):
    if (
        await DatasetDBViewList.find_one(
            Or(
                DatasetDBViewList.id == PydanticObjectId(dataset_id),
            )
        )
    ) is not None:
        if authenticated or public or (admin and admin_mode):
            query = [
                FolderFileViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
        else:
            query = [
                FolderFileViewList.dataset_id == PydanticObjectId(dataset_id),
                Or(
                    FolderFileViewList.creator.email == user_id,
                    FolderFileViewList.auth.user_ids == user_id,
                ),
            ]

        if folder_id is None:
            # only show folder and file at root level without parent folder
            query.append(
                And(
                    FolderFileViewList.parent_folder == None,  # noqa: E711
                    FolderFileViewList.folder_id == None,  # noqa: E711
                )
            )
        else:
            query.append(
                Or(
                    FolderFileViewList.folder_id == PydanticObjectId(folder_id),
                    FolderFileViewList.parent_folder == PydanticObjectId(folder_id),
                )
            )

        folders_files_and_count = (
            await FolderFileViewList.find(*query)
            .aggregate(
                [
                    _get_page_query(
                        skip,
                        limit,
                        sort_clause={
                            "$sort": {
                                "object_type": -1,  # folder first
                                "created": -1,  # then sort by created descendingly
                            }
                        },
                    )
                ],
            )
            .to_list()
        )
        page_metadata = _construct_page_metadata(folders_files_and_count, skip, limit)
        page = Paged(
            metadata=page_metadata,
            data=[
                FileOut(id=item.pop("_id"), **item)
                if item.get("object_type") == "file"
                else FolderOut(id=item.pop("_id"), **item)
                for item in folders_files_and_count[0]["data"]
            ],
        )
        return page.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.delete("/{dataset_id}/folders/{folder_id}")
async def delete_folder(
    dataset_id: str,
    folder_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(Authorization("editor")),
):
    if (await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
            # delete current folder and files
            async for file in FileDB.find(
                FileDB.folder_id == PydanticObjectId(folder_id)
            ):
                await remove_file_entry(file.id, fs, es)

            # recursively delete child folder and files
            async def _delete_nested_folders(parent_folder_id):
                while (
                    await FolderDB.find_one(
                        FolderDB.dataset_id == PydanticObjectId(dataset_id),
                        FolderDB.parent_folder == PydanticObjectId(parent_folder_id),
                    )
                ) is not None:
                    async for subfolder in FolderDB.find(
                        FolderDB.dataset_id == PydanticObjectId(dataset_id),
                        FolderDB.parent_folder == PydanticObjectId(parent_folder_id),
                    ):
                        async for file in FileDB.find(FileDB.folder_id == subfolder.id):
                            await remove_file_entry(file.id, fs, es)
                        await _delete_nested_folders(subfolder.id)
                        await subfolder.delete()
                        await remove_folder_index(subfolder.id, es)

            await _delete_nested_folders(folder_id)
            await folder.delete()
            await remove_folder_index(folder.id, es)
            return {"deleted": folder_id}
        else:
            raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders/{folder_id}")
async def get_folder(
    dataset_id: str,
    folder_id: str,
    allow: bool = Depends(Authorization("viewer")),
):
    if (
        await DatasetDBViewList.find_one(
            Or(
                DatasetDBViewList.id == PydanticObjectId(dataset_id),
            )
        )
    ) is not None:
        if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
            return folder.dict()
        else:
            raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}/folders/{folder_id}", response_model=FolderOut)
async def patch_folder(
    dataset_id: str,
    folder_id: str,
    folder_info: FolderPatch,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    user=Depends(get_current_user),
    allow: bool = Depends(Authorization("editor")),
):
    if await DatasetDB.get(PydanticObjectId(dataset_id)) is not None:
        if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
            # update folder
            if folder_info.name is not None:
                folder.name = folder_info.name
            # allow moving folder around within the hierarchy
            if folder_info.parent_folder is not None:
                if (
                    await FolderDB.get(PydanticObjectId(folder_info.parent_folder))
                    is not None
                ):
                    folder.parent_folder = folder_info.parent_folder
            folder.modified = datetime.datetime.utcnow()
            await folder.save()
            await index_folder(es, FolderOut(**folder.dict()), update=True)

            return folder.dict()
        else:
            raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


# new endpoint for /{dataset_id}/local_files
# new endpoint for /{dataset_id}/remote_files


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = None,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es=Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(Authorization("uploader")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if user is None:
            raise HTTPException(
                status_code=401, detail="User not found. Session might have expired."
            )

        new_file = FileDB(
            name=file.filename,
            creator=user,
            dataset_id=dataset.id,
            status=dataset.status,
        )

        if folder_id is not None:
            if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
                new_file.folder_id = folder.id
            else:
                raise HTTPException(
                    status_code=404, detail=f"Folder {folder_id} not found"
                )
        file_public = False
        file_authenticated = False
        if dataset.status == DatasetStatus.PUBLIC:
            file_public = True
        elif dataset.status == DatasetStatus.AUTHENTICATED:
            file_authenticated = True
        await add_file_entry(
            new_file,
            user,
            fs,
            es,
            rabbitmq_client,
            file.file,
            content_type=file.content_type,
            authenticated=file_authenticated,
            public=file_public,
        )
        return new_file.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/filesMultiple", response_model=List[FileOut])
async def save_files(
    dataset_id: str,
    files: List[UploadFile],
    folder_id: Optional[str] = None,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    es=Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(Authorization("uploader")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        files_added = []
        for file in files:
            if user is None:
                raise HTTPException(
                    status_code=401,
                    detail="User not found. Session might have expired.",
                )

            new_file = FileDB(
                name=file.filename,
                creator=user,
                dataset_id=dataset.id,
                status=dataset.status,
            )

            if folder_id is not None:
                if (
                    folder := await FolderDB.get(PydanticObjectId(folder_id))
                ) is not None:
                    new_file.folder_id = folder.id
                else:
                    raise HTTPException(
                        status_code=404, detail=f"Folder {folder_id} not found"
                    )

            public = False
            authenticated = False
            if dataset.status == "PUBLIC":
                public = True
            if dataset.status == "AUTHENTICATED":
                authenticated = True
            await add_file_entry(
                new_file,
                user,
                fs,
                es,
                rabbitmq_client,
                file.file,
                content_type=file.content_type,
                public=public,
                authenticated=authenticated,
            )
            files_added.append(new_file.dict())
        return files_added

    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/local_files", response_model=FileOut)
async def save_local_file(
    localfile_in: LocalFileIn,
    dataset_id: str,
    folder_id: Optional[str] = None,
    user=Depends(get_current_user),
    es=Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(Authorization("uploader")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if user is None:
            raise HTTPException(
                status_code=401, detail="User not found. Session might have expired."
            )

        # Check to make sure file is cleared to proceed
        cleared = False
        for wpath in settings.LOCAL_WHITELIST:
            if localfile_in.path.startswith(wpath):
                cleared = True
        if not cleared:
            raise HTTPException(
                status_code=500,
                detail="File is not located in a whitelisted directory.",
            )

        (dirname, filename) = os.path.split(localfile_in.path)
        new_file = FileDB(
            name=filename,
            creator=user,
            dataset_id=dataset.id,
            storage_type=StorageType.LOCAL,
            storage_path=localfile_in.path,
            bytes=os.path.getsize(localfile_in.path),
        )

        if folder_id is not None:
            if (folder := await FolderDB.get(PydanticObjectId(folder_id))) is not None:
                new_file.folder_id = folder.id
            else:
                raise HTTPException(
                    status_code=404, detail=f"Folder {folder_id} not found"
                )

        await add_local_file_entry(
            new_file,
            user,
            es,
            rabbitmq_client,
        )
        return new_file.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/createFromZip", response_model=DatasetOut)
async def create_dataset_from_zip(
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    token: str = Depends(get_token),
):
    if file.filename.endswith(".zip") is False:
        raise HTTPException(status_code=404, detail="File is not a zip file")

    # Read contents of zip file into temporary location
    with tempfile.TemporaryFile() as tmp_zip:
        tmp_zip.write(file.file.read())

        with zipfile.ZipFile(tmp_zip, "r") as zip_file:
            zip_contents = zip_file.namelist()
            zip_directory = _describe_zip_contents(zip_contents)

        # Create dataset
        dataset_in = {
            "name": file.filename.rstrip(".zip"),
            "description": "Uploaded as %s" % file.filename,
        }
        dataset = DatasetDB(**dataset_in, creator=user)
        dataset.save()

        # Create folders
        folder_lookup = await _create_folder_structure(
            dataset.id, zip_directory, "", {}, user
        )

        # Go back through zipfile, this time uploading files to folders
        with zipfile.ZipFile(tmp_zip, "r") as zip_file:
            for entry in zip_contents:
                if "__MACOSX" in entry or entry.endswith(".DS_Store"):
                    # TODO: These are not visible in OSX 10.3+ and hard to delete. Leaving this in to minimize user frustration.
                    continue

                # Create temporary file and upload
                if not entry.endswith(os.path.sep):
                    filename = os.path.basename(entry)
                    foldername = os.path.sep + os.path.dirname(entry)
                    extracted = zip_file.extract(entry, path="/tmp")
                    if foldername in folder_lookup:
                        folder_id = folder_lookup[foldername]
                        new_file = FileDB(
                            name=filename,
                            creator=user,
                            dataset_id=dataset.id,
                            folder_id=folder_id,
                        )
                    else:
                        new_file = FileDB(
                            name=filename, creator=user, dataset_id=dataset.id
                        )
                    with open(extracted, "rb") as file_reader:
                        await add_file_entry(
                            new_file,
                            user,
                            fs,
                            es,
                            rabbitmq_client,
                            token,
                            file_reader,
                        )
                    if os.path.isfile(extracted):
                        os.remove(extracted)

    return dataset.dict()


@router.get("/{dataset_id}/download")
async def download_dataset(
    dataset_id: str,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(Authorization("viewer")),
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        current_temp_dir = tempfile.mkdtemp(prefix="rocratedownload")
        crate = ROCrate()
        user_full_name = user.first_name + " " + user.last_name
        user_crate_id = str(user.id)
        crate.add(Person(crate, user_crate_id, properties={"name": user_full_name}))

        manifest_path = os.path.join(current_temp_dir, "manifest-md5.txt")
        bagit_path = os.path.join(current_temp_dir, "bagit.txt")
        bag_info_path = os.path.join(current_temp_dir, "bag-info.txt")
        tagmanifest_path = os.path.join(current_temp_dir, "tagmanifest-md5.txt")

        await run_in_threadpool(lambda: open(manifest_path, "w").close())
        await run_in_threadpool(lambda: open(manifest_path, "w").close())
        await run_in_threadpool(
            lambda: open(bagit_path, "w").write(
                "Bag-Software-Agent: clowder.ncsa.illinois.edu"
                + "\n"
                + "Bagging-Date: "
                + str(datetime.datetime.now())
                + "\n"
            )
        )

        await run_in_threadpool(
            lambda: open(bag_info_path, "w").write(
                "BagIt-Version: 0.97"
                + "\n"
                + "Tag-File-Character-Encoding: UTF-8"
                + "\n"
            )
        )

        # Write dataset metadata if found
        metadata = await MetadataDB.find(
            MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)
        ).to_list()
        if len(metadata) > 0:
            datasetmetadata_path = os.path.join(
                current_temp_dir, "_dataset_metadata.json"
            )
            metadata_content = json_util.dumps(metadata)
            with open(datasetmetadata_path, "w") as f:
                f.write(metadata_content)
            await run_in_threadpool(
                lambda: open(datasetmetadata_path, "w").write(metadata_content)
            )

            crate.add_file(
                datasetmetadata_path,
                dest_path="metadata/_dataset_metadata.json",
                properties={"name": "_dataset_metadata.json"},
            )

        bag_size = 0  # bytes
        file_count = 0

        async for file in FileDBViewList.find(
            FileDBViewList.dataset_id == PydanticObjectId(dataset_id)
        ):
            # find the bytes id
            # if it's working draft file_id == origin_id
            # if it's published origin_id points to the raw bytes
            bytes_file_id = str(file.origin_id) if file.origin_id else str(file.id)
            file_count += 1
            file_name = file.name
            if file.folder_id is not None:
                hierarchy = await _get_folder_hierarchy(file.folder_id, "")
                dest_folder = os.path.join(current_temp_dir, hierarchy.lstrip("/"))
                if not os.path.isdir(dest_folder):
                    await run_in_threadpool(os.makedirs, dest_folder, exist_ok=True)
                file_name = hierarchy + file_name
            current_file_path = os.path.join(current_temp_dir, file_name.lstrip("/"))

            content = fs.get_object(settings.MINIO_BUCKET_NAME, bytes_file_id)
            file_md5_hash = hashlib.md5(content.data).hexdigest()
            await run_in_threadpool(
                lambda: open(current_file_path, "wb").write(content.data)
            )
            await run_in_threadpool(
                lambda: open(manifest_path, "a").write(
                    file_md5_hash + " " + file_name + "\n"
                )
            )
            crate.add_file(
                current_file_path,
                dest_path="data/" + file_name,
                properties={"name": file_name},
            )
            content.close()
            content.release_conn()

            current_file_size = os.path.getsize(current_file_path)
            bag_size += current_file_size

            metadata = await MetadataDB.find(
                MetadataDB.resource.resource_id == PydanticObjectId(dataset_id)
            ).to_list()
            if len(metadata) > 0:
                metadata_filename = file_name + "_metadata.json"
                metadata_filename_temp_path = os.path.join(
                    current_temp_dir, metadata_filename
                )
                metadata_content = json_util.dumps(metadata)
                await run_in_threadpool(
                    lambda: open(metadata_filename_temp_path, "w").write(
                        metadata_content
                    )
                )
                crate.add_file(
                    metadata_filename_temp_path,
                    dest_path="metadata/" + metadata_filename,
                    properties={"name": metadata_filename},
                )

        bag_size_kb = bag_size / 1024
        await run_in_threadpool(
            lambda: open(bagit_path, "a").write(
                "Bag-Size: "
                + str(bag_size_kb)
                + " kB"
                + "\n"
                + "Payload-Oxum: "
                + str(bag_size)
                + "."
                + str(file_count)
                + "\n"
                + "Internal-Sender-Identifier: "
                + dataset_id
                + "\n"
                + "Internal-Sender-Description: "
                + dataset.description
                + "\n"
                + "Contact-Name: "
                + user_full_name
                + "\n"
                + "Contact-Email: "
                + user.email
                + "\n"
            )
        )
        crate.add_file(
            bagit_path, dest_path="bagit.txt", properties={"name": "bagit.txt"}
        )
        crate.add_file(
            manifest_path,
            dest_path="manifest-md5.txt",
            properties={"name": "manifest-md5.txt"},
        )
        crate.add_file(
            bag_info_path, dest_path="bag-info.txt", properties={"name": "bag-info.txt"}
        )

        # Generate tag manifest file
        manifest_md5_hash = await run_in_threadpool(
            lambda: hashlib.md5(open(manifest_path, "rb").read()).hexdigest()
        )
        bagit_md5_hash = await run_in_threadpool(
            lambda: hashlib.md5(open(bagit_path, "rb").read()).hexdigest()
        )
        bag_info_md5_hash = await run_in_threadpool(
            lambda: hashlib.md5(open(bag_info_path, "rb").read()).hexdigest()
        )

        await run_in_threadpool(
            lambda: open(tagmanifest_path, "w").write(
                bagit_md5_hash
                + " "
                + "bagit.txt"
                + "\n"
                + manifest_md5_hash
                + " "
                + "manifest-md5.txt"
                + "\n"
                + bag_info_md5_hash
                + " "
                + "bag-info.txt"
                + "\n"
            )
        )

        crate.add_file(
            tagmanifest_path,
            dest_path="tagmanifest-md5.txt",
            properties={"name": "tagmanifest-md5.txt"},
        )

        version_name = (
            f"-v{dataset.frozen_version_num}"
            if dataset.frozen and dataset.frozen_version_num > 0
            else ""
        )
        zip_name = dataset.name + version_name + ".zip"
        path_to_zip = os.path.join(current_temp_dir, zip_name)

        await run_in_threadpool(crate.write_zip, path_to_zip)  # takes the most time?

        f = await run_in_threadpool(open, path_to_zip, "rb", 0)
        zip_bytes = await run_in_threadpool(f.read)
        stream = io.BytesIO(zip_bytes)
        await run_in_threadpool(f.close)

        try:
            await run_in_threadpool(shutil.rmtree, current_temp_dir)
        except Exception as e:
            print("could not delete file")
            print(e)

        # Get content type & open file stream
        response = StreamingResponse(
            stream,
            media_type="application/x-zip-compressed",
        )
        response.headers["Content-Disposition"] = "attachment; filename=%s" % zip_name
        await _increment_data_downloads(dataset_id)

        # reindex
        await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
        # Update folders index since its using dataset downloads and status to index
        async for folder in FolderDB.find(
            FolderDB.dataset_id == PydanticObjectId(dataset_id)
        ):
            await index_folder(es, FolderOut(**folder.dict()), update=True)

        return response
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


# submits file to extractor
# can handle parameeters pass in as key/values in info
@router.post("/{dataset_id}/extract")
async def get_dataset_extract(
    dataset_id: str,
    extractorName: str,
    request: Request,
    # parameters don't have a fixed model shape
    parameters: dict = None,
    user=Depends(get_current_user),
    rabbitmq_client: BlockingChannel = Depends(dependencies.get_rabbitmq),
    allow: bool = Depends(Authorization("uploader")),
):
    if extractorName is None:
        raise HTTPException(status_code=400, detail="No extractorName specified")
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        queue = extractorName
        routing_key = queue
        return await submit_dataset_job(
            DatasetOut(**dataset.dict()),
            routing_key,
            parameters,
            user,
            rabbitmq_client,
        )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/thumbnail")
async def download_dataset_thumbnail(
    dataset_id: str,
    fs: Minio = Depends(dependencies.get_fs),
    allow: bool = Depends(Authorization("viewer")),
):
    # If dataset exists in MongoDB, download from Minio
    if (
        dataset := await DatasetDBViewList.find_one(
            Or(
                DatasetDBViewList.id == PydanticObjectId(dataset_id),
            )
        )
    ) is not None:
        if dataset.thumbnail_id is not None:
            content = fs.get_object(
                settings.MINIO_BUCKET_NAME, str(dataset.thumbnail_id)
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Dataset {dataset_id} has no associated thumbnail",
            )

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        # TODO: How should filenames be handled for thumbnails?
        response.headers["Content-Disposition"] = "attachment; filename=%s" % "thumb"
        return response
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}/thumbnail/{thumbnail_id}", response_model=DatasetOut)
async def add_dataset_thumbnail(
    dataset_id: str,
    thumbnail_id: str,
    allow: bool = Depends(Authorization("editor")),
):
    if (dataset := await DatasetDB.get(PydanticObjectId(dataset_id))) is not None:
        if (await ThumbnailDB.get(PydanticObjectId(thumbnail_id))) is not None:
            # TODO: Should we garbage collect existing thumbnail if nothing else points to it?
            dataset.thumbnail_id = thumbnail_id
            await dataset.save()
            return dataset.dict()
        else:
            raise HTTPException(
                status_code=404, detail=f"Thumbnail {thumbnail_id} not found"
            )
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
