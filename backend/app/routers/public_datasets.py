import datetime
import hashlib
import io
import os
import shutil
import tempfile
from typing import List, Optional

from app import dependencies
from app.config import settings
from app.db.dataset.download import _increment_data_downloads
from app.db.folder.hierarchy import _get_folder_hierarchy
from app.models.datasets import (
    DatasetDBViewList,
    DatasetFreezeDB,
    DatasetFreezeOut,
    DatasetOut,
    DatasetStatus,
)
from app.models.files import FileDBViewList, FileOut
from app.models.folder_and_file import FolderFileViewList
from app.models.folders import FolderDB, FolderDBViewList, FolderOut
from app.models.metadata import MetadataDBViewList, MetadataDefinitionDB, MetadataOut
from app.models.pages import Paged, _construct_page_metadata, _get_page_query
from app.search.index import index_dataset, index_folder
from beanie import PydanticObjectId
from beanie.operators import And, Or
from bson import json_util
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from minio import Minio
from rocrate.rocrate import ROCrate

router = APIRouter()
security = HTTPBearer()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


@router.get("", response_model=Paged)
async def get_datasets(
    skip: int = 0,
    limit: int = 10,
):
    query = [
        DatasetDBViewList.status == DatasetStatus.PUBLIC,
        DatasetDBViewList.frozen == False,  # noqa: E712
    ]

    datasets_and_count = (
        await DatasetDBViewList.find(*query)
        .aggregate(
            [_get_page_query(skip, limit, sort_field="created", ascending=False)],
        )
        .to_list()
    )
    page_metadata = _construct_page_metadata(datasets_and_count, skip, limit)
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
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            return dataset.dict()
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files", response_model=List[FileOut])
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                FileDBViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
            if folder_id is not None:
                query.append(FileDBViewList.folder_id == PydanticObjectId(folder_id))
            files = await FileDBViewList.find(*query).skip(skip).limit(limit).to_list()
            return [file.dict() for file in files]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders", response_model=List[FolderOut])
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                FolderDBViewList.dataset_id == PydanticObjectId(dataset_id),
            ]
            if parent_folder is not None:
                query.append(
                    FolderDBViewList.parent_folder == PydanticObjectId(parent_folder)
                )
            else:
                query.append(FolderDBViewList.parent_folder == None)  # noqa: E711
            folders = (
                await FolderDBViewList.find(*query).skip(skip).limit(limit).to_list()
            )
            return [folder.dict() for folder in folders]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/folders_and_files", response_model=Paged)
async def get_dataset_folders_and_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                FolderFileViewList.dataset_id == PydanticObjectId(dataset_id),
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
            page_metadata = _construct_page_metadata(
                folders_files_and_count, skip, limit
            )
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


@router.get("/{dataset_id}/metadata", response_model=List[MetadataOut])
async def get_dataset_metadata(
    dataset_id: str,
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            query = [
                MetadataDBViewList.resource.resource_id == PydanticObjectId(dataset_id)
            ]

            if listener_name is not None:
                query.append(MetadataDBViewList.agent.listener.name == listener_name)
            if listener_version is not None:
                query.append(
                    MetadataDBViewList.agent.listener.version == listener_version
                )

            metadata = []
            async for md in MetadataDBViewList.find(*query):
                if md.definition is not None:
                    if (
                        md_def := await MetadataDefinitionDB.find_one(
                            MetadataDefinitionDB.name == md.definition
                        )
                    ) is not None:
                        md.description = md_def.description
                metadata.append(md)
            return [md.dict() for md in metadata]
        else:
            raise HTTPException(
                status_code=404, detail=f"Dataset {dataset_id} not found"
            )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/download", response_model=DatasetOut)
async def download_dataset(
    dataset_id: str,
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (
        dataset := await DatasetDBViewList.find_one(
            DatasetDBViewList.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        if dataset.status == DatasetStatus.PUBLIC.name:
            current_temp_dir = tempfile.mkdtemp(prefix="rocratedownload")
            crate = ROCrate()

            manifest_path = os.path.join(current_temp_dir, "manifest-md5.txt")
            bagit_path = os.path.join(current_temp_dir, "bagit.txt")
            bag_info_path = os.path.join(current_temp_dir, "bag-info.txt")
            tagmanifest_path = os.path.join(current_temp_dir, "tagmanifest-md5.txt")

            with open(manifest_path, "w") as f:
                pass  # Create empty file so no errors later if the dataset is empty

            with open(bagit_path, "w") as f:
                f.write("Bag-Software-Agent: clowder.ncsa.illinois.edu" + "\n")
                f.write("Bagging-Date: " + str(datetime.datetime.now()) + "\n")

            with open(bag_info_path, "w") as f:
                f.write("BagIt-Version: 0.97" + "\n")
                f.write("Tag-File-Character-Encoding: UTF-8" + "\n")

            # Write dataset metadata if found
            metadata = await MetadataDBViewList.find(
                MetadataDBViewList.resource.resource_id == PydanticObjectId(dataset_id)
            ).to_list()
            if len(metadata) > 0:
                datasetmetadata_path = os.path.join(
                    current_temp_dir, "_dataset_metadata.json"
                )
                metadata_content = json_util.dumps(metadata)
                with open(datasetmetadata_path, "w") as f:
                    f.write(metadata_content)
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
                        os.makedirs(dest_folder, exist_ok=True)
                    file_name = hierarchy + file_name
                current_file_path = os.path.join(
                    current_temp_dir, file_name.lstrip("/")
                )

                content = fs.get_object(settings.MINIO_BUCKET_NAME, bytes_file_id)
                file_md5_hash = hashlib.md5(content.data).hexdigest()
                with open(current_file_path, "wb") as f1:
                    f1.write(content.data)
                with open(manifest_path, "a") as mpf:
                    mpf.write(file_md5_hash + " " + file_name + "\n")
                crate.add_file(
                    current_file_path,
                    dest_path="data/" + file_name,
                    properties={"name": file_name},
                )
                content.close()
                content.release_conn()

                current_file_size = os.path.getsize(current_file_path)
                bag_size += current_file_size

                metadata = await MetadataDBViewList.find(
                    MetadataDBViewList.resource.resource_id
                    == PydanticObjectId(dataset_id)
                ).to_list()
                if len(metadata) > 0:
                    metadata_filename = file_name + "_metadata.json"
                    metadata_filename_temp_path = os.path.join(
                        current_temp_dir, metadata_filename
                    )
                    metadata_content = json_util.dumps(metadata)
                    with open(metadata_filename_temp_path, "w") as f:
                        f.write(metadata_content)
                    crate.add_file(
                        metadata_filename_temp_path,
                        dest_path="metadata/" + metadata_filename,
                        properties={"name": metadata_filename},
                    )

            bag_size_kb = bag_size / 1024

            with open(bagit_path, "a") as f:
                f.write("Bag-Size: " + str(bag_size_kb) + " kB" + "\n")
                f.write("Payload-Oxum: " + str(bag_size) + "." + str(file_count) + "\n")
                f.write("Internal-Sender-Identifier: " + dataset_id + "\n")
                f.write("Internal-Sender-Description: " + dataset.description + "\n")
            crate.add_file(
                bagit_path, dest_path="bagit.txt", properties={"name": "bagit.txt"}
            )
            crate.add_file(
                manifest_path,
                dest_path="manifest-md5.txt",
                properties={"name": "manifest-md5.txt"},
            )
            crate.add_file(
                bag_info_path,
                dest_path="bag-info.txt",
                properties={"name": "bag-info.txt"},
            )

            # Generate tag manifest file
            manifest_md5_hash = hashlib.md5(
                open(manifest_path, "rb").read()
            ).hexdigest()
            bagit_md5_hash = hashlib.md5(open(bagit_path, "rb").read()).hexdigest()
            bag_info_md5_hash = hashlib.md5(
                open(bag_info_path, "rb").read()
            ).hexdigest()

            with open(tagmanifest_path, "w") as f:
                f.write(bagit_md5_hash + " " + "bagit.txt" + "\n")
                f.write(manifest_md5_hash + " " + "manifest-md5.txt" + "\n")
                f.write(bag_info_md5_hash + " " + "bag-info.txt" + "\n")
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
            crate.write_zip(path_to_zip)
            f = open(path_to_zip, "rb", buffering=0)
            zip_bytes = f.read()
            stream = io.BytesIO(zip_bytes)
            f.close()
            try:
                shutil.rmtree(current_temp_dir)
            except Exception as e:
                print("could not delete file")
                print(e)

            # Get content type & open file stream
            response = StreamingResponse(
                stream,
                media_type="application/x-zip-compressed",
            )
            response.headers["Content-Disposition"] = (
                "attachment; filename=%s" % zip_name
            )
            await _increment_data_downloads(dataset_id)

            # reindex
            await index_dataset(es, DatasetOut(**dataset.dict()), update=True)
            # Update folders index since its using dataset downloads and status to index
            async for folder in FolderDB.find(
                FolderDB.dataset_id == PydanticObjectId(dataset_id)
            ):
                await index_folder(es, FolderOut(**folder.dict()), update=True)

            return response
        else:
            raise HTTPException(
                status_code=404, detail=f"Dataset {dataset_id} not found"
            )
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/freeze", response_model=Paged)
async def get_freeze_datasets(
    dataset_id: str,
    skip: int = 0,
    limit: int = 10,
):
    frozen_datasets_and_count = (
        await DatasetFreezeDB.find(
            DatasetFreezeDB.status == DatasetStatus.PUBLIC,
            DatasetFreezeDB.origin_id == PydanticObjectId(dataset_id),
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
