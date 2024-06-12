from typing import Optional, Union

from app.config import settings
from app.db.folder.version import _freeze_folder
from app.models.authorization import AuthorizationDB
from app.models.datasets import DatasetDB, DatasetFreezeDB
from app.models.files import FileDB, FileFreezeDB, FileVersionDB, StorageType
from app.models.folders import FolderDB, FolderFreezeDB
from app.models.metadata import MetadataDB, MetadataFreezeDB
from app.models.thumbnails import ThumbnailDB, ThumbnailFreezeDB
from app.models.visualization_config import (
    VisualizationConfigDB,
    VisualizationConfigFreezeDB,
)
from app.models.visualization_data import VisualizationDataDB, VisualizationDataFreezeDB
from app.search.connect import delete_document_by_id
from beanie import PydanticObjectId
from beanie.odm.operators.find.logical import And
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import HTTPException
from minio import Minio


async def _freeze_file_metadata(file, new_frozen_file_id: PydanticObjectId):
    """
    Release metadata associated with a file.
    Args:
        file (FileDB): The file whose metadata needs to be released.
        new_frozen_file_id (PydanticObjectId): The ID of the new released file.
    """
    file_metadata = await MetadataDB.find(
        And(
            MetadataDB.resource.resource_id == ObjectId(file.id),
            MetadataDB.resource.collection == "files",
        )
    ).to_list()
    for fm in file_metadata:
        fm_data = fm.dict()
        fm_data["origin_id"] = fm_data.pop("id")
        fm_data["resource"]["resource_id"] = new_frozen_file_id
        fm_data["frozen"] = True
        frozen_metadata = MetadataFreezeDB(**fm_data)
        await frozen_metadata.insert()


async def _freeze_file_thumbnail(thumbnail_id):
    """
    Release a file's thumbnail.
    Args:
        thumbnail_id (str): The ID of the thumbnail to be released.
    Returns:
        str: The ID of the newly created released thumbnail.
    """
    file_thumbnail = await ThumbnailDB.get(PydanticObjectId(thumbnail_id))
    file_thumbnail_data = file_thumbnail.dict()
    file_thumbnail_data["origin_id"] = file_thumbnail_data.pop("id")
    file_thumbnail_data["frozen"] = True
    frozen_file_thumbnail = ThumbnailFreezeDB(**file_thumbnail_data)
    await frozen_file_thumbnail.insert()

    return frozen_file_thumbnail.id


async def _freeze_file_visualization(file, new_frozen_file_id: PydanticObjectId):
    """
    Release visualizations associated with a file.
    Args:
        file (FileDB): The file whose visualizations need to be released.
        new_frozen_file_id (PydanticObjectId): The ID of the new released file.
    """
    file_vis_config = await VisualizationConfigDB.find(
        And(
            VisualizationConfigDB.resource.resource_id == ObjectId(file.id),
            VisualizationConfigDB.resource.collection == "files",
        )
    ).to_list()
    for fvc in file_vis_config:
        fvc_data = fvc.dict()
        fvc_data["origin_id"] = fvc_data.pop("id")
        fvc_data["resource"]["resource_id"] = new_frozen_file_id
        fvc_data["frozen"] = True
        frozen_vis_config = VisualizationConfigFreezeDB(**fvc_data)
        await frozen_vis_config.insert()

        # freeze the associate visualization data
        file_vis_data = await VisualizationDataDB.find(
            VisualizationDataDB.visualization_config_id == fvc_data["origin_id"]
        ).to_list()
        for fvd in file_vis_data:
            fvd_data = fvd.dict()
            fvd_data["origin_id"] = fvd_data.pop("id")
            # update the visualization config id to the new frozen visualization config id
            fvd_data["visualization_config_id"] = frozen_vis_config.id
            fvd_data["frozen"] = True
            frozen_vis_data = VisualizationDataFreezeDB(**fvd_data)
            await frozen_vis_data.insert()


async def _freeze_files_folders_w_metadata_vis(
    dataset_id: str, new_frozen_dataset_id: PydanticObjectId
):
    """
    Release files and folders along with their metadata and visualizations for a dataset.
    Args:
        dataset_id (str): The ID of the dataset to be released.
        new_frozen_dataset_id (PydanticObjectId): The ID of the new released dataset.
    """
    # freeze folders first and save frozen folder id to a hashmap
    folders = await FolderDB.find(FolderDB.dataset_id == ObjectId(dataset_id)).to_list()
    parent_id_map = {}
    for folder in folders:
        await _freeze_folder(folder, new_frozen_dataset_id, parent_id_map)

    # then freeze file
    files = await FileDB.find(FileDB.dataset_id == ObjectId(dataset_id)).to_list()
    for file in files:
        file_data = file.dict()
        file_data["origin_id"] = file_data.pop("id")
        file_data["dataset_id"] = new_frozen_dataset_id
        file_data["frozen"] = True

        # if file belongs to a folder
        if file_data["folder_id"] and file_data["folder_id"] in parent_id_map:
            file_data["folder_id"] = parent_id_map[file_data["folder_id"]]

        # if file has thumbnail
        if file_data["thumbnail_id"]:
            frozen_file_thumbnail_id = await _freeze_file_thumbnail(
                file_data["thumbnail_id"]
            )
            file_data["thumbnail_id"] = frozen_file_thumbnail_id

        frozen_file = FileFreezeDB(**file_data)
        await frozen_file.insert()

        # if there are associate metadata on the file
        await _freeze_file_metadata(file, frozen_file.id)

        # if there are associate visualization on the file
        await _freeze_file_visualization(file, frozen_file.id)


async def _freeze_dataset_metadata(
    dataset_id: str, new_frozen_dataset_id: PydanticObjectId
):
    """
    Release metadata associated with a dataset.
    Args:
        dataset_id (str): The ID of the dataset whose metadata needs to be released.
        new_frozen_dataset_id (PydanticObjectId): The ID of the new released dataset.
    """
    dataset_metadata = await MetadataDB.find(
        And(
            MetadataDB.resource.resource_id == ObjectId(dataset_id),
            MetadataDB.resource.collection == "datasets",
        )
    ).to_list()
    for dm in dataset_metadata:
        dm_data = dm.dict()
        dm_data["origin_id"] = dm_data.pop("id")
        dm_data["resource"]["resource_id"] = new_frozen_dataset_id
        dm_data["frozen"] = True
        frozen_metadata = MetadataFreezeDB(**dm_data)
        await frozen_metadata.insert()


async def _freeze_dataset_thumbnail(thumbnail_id: PydanticObjectId):
    """
    Release a dataset's thumbnail.
    Args:
        thumbnail_id (PydanticObjectId): The ID of the thumbnail to be released.
    Returns:
        str: The ID of the newly created released thumbnail.
    """
    dataset_thumbnail = await ThumbnailDB.get(thumbnail_id)
    dataset_thumbnail_data = dataset_thumbnail.dict()
    dataset_thumbnail_data["origin_id"] = dataset_thumbnail_data.pop("id")
    dataset_thumbnail_data["frozen"] = True
    frozen_dataset_thumbnail = ThumbnailFreezeDB(**dataset_thumbnail_data)
    await frozen_dataset_thumbnail.insert()

    return frozen_dataset_thumbnail.id


async def _freeze_dataset_visualization(
    dataset_id: str, new_frozen_dataset_id: PydanticObjectId
):
    """
    Release visualizations associated with a dataset.
    Args:
        dataset_id (str): The ID of the dataset whose visualizations need to be released.
        new_frozen_dataset_id (PydanticObjectId): The ID of the new released dataset.
    """
    dataset_vis_config = await VisualizationConfigDB.find(
        And(
            VisualizationConfigDB.resource.resource_id == ObjectId(dataset_id),
            VisualizationConfigDB.resource.collection == "datasets",
        )
    ).to_list()
    for dvc in dataset_vis_config:
        dvc_data = dvc.dict()
        dvc_data["origin_id"] = dvc_data.pop("id")
        dvc_data["resource"]["resource_id"] = new_frozen_dataset_id
        dvc_data["frozen"] = True
        frozen_vis_config = VisualizationConfigFreezeDB(**dvc_data)
        await frozen_vis_config.insert()

        # freeze the associate visualization data
        dataset_vis_data = await VisualizationDataDB.find(
            VisualizationDataDB.visualization_config_id == dvc_data["origin_id"]
        ).to_list()
        for dvd in dataset_vis_data:
            dvd_data = dvd.dict()
            dvd_data["origin_id"] = dvd_data.pop("id")
            # update the visualization config id to the new frozen visualization config id
            dvd_data["visualization_config_id"] = frozen_vis_config.id
            dvd_data["frozen"] = True
            frozen_vis_data = VisualizationDataFreezeDB(**dvd_data)
            await frozen_vis_data.insert()


async def _delete_frozen_visualizations(
    resource: Union[DatasetFreezeDB, FileFreezeDB], fs: Optional[Minio]
):
    """
    Delete the visualizations associated with a released resource.

    Args:
        resource(Union[DatasetFreezeDB, FileFreezeDB]): file or dataset.
        fs (Optional[Minio]): The Minio file system client.
    """
    async for frozen_vis_config in VisualizationConfigFreezeDB.find(
        VisualizationConfigFreezeDB.resource.resource_id
        == PydanticObjectId(resource.id),
    ):
        # delete mongo document
        await frozen_vis_config.delete()

        # delete associate visualization data
        async for frozen_vis_data in VisualizationDataFreezeDB.find(
            VisualizationDataFreezeDB.visualization_config_id
            == PydanticObjectId(frozen_vis_config.id),
        ):
            # delete mongo document
            await frozen_vis_data.delete()

            if fs is not None:
                # if vis data is not used by other frozen dataset, delete the raw bytes too
                if (
                    await VisualizationDataFreezeDB.find_one(
                        VisualizationDataFreezeDB.origin_id
                        == PydanticObjectId(frozen_vis_data.origin_id)
                    )
                    is None
                ) and (
                    await VisualizationDataDB.find_one(
                        VisualizationDataDB.id != frozen_vis_data.origin_id
                    )
                    is None
                ):
                    fs.remove_object(
                        settings.MINIO_BUCKET_NAME, str(frozen_vis_data.origin_id)
                    )

        return frozen_vis_config.dict()


async def _delete_visualizations(
    resource: Union[DatasetDB, FileDB], fs: Optional[Minio]
):
    """
    Delete the visualizations associated with a current/latest resource.

    Args:
        resource (Union[DatasetDB, FileDB]): file or dataset.
        fs (Optional[Minio]): The Minio file system client.
    """
    async for vis_config in VisualizationConfigDB.find(
        VisualizationConfigDB.resource.resource_id == PydanticObjectId(resource.id),
    ):
        # delete mongo document
        await vis_config.delete()

        # delete associate visualization data
        async for vis_data in VisualizationDataDB.find(
            VisualizationDataDB.visualization_config_id
            == PydanticObjectId(vis_config.id),
        ):
            # delete mongo document
            await vis_data.delete()

            if fs is not None:
                # if vis data is not used by other frozen dataset, delete the raw bytes too
                if (
                    await VisualizationDataFreezeDB.find_one(
                        VisualizationDataFreezeDB.origin_id
                        == PydanticObjectId(vis_data.id)
                    )
                    is None
                ):
                    fs.remove_object(settings.MINIO_BUCKET_NAME, str(vis_data.id))

        return vis_config.dict()


async def _delete_frozen_thumbnail(
    resource: Union[DatasetFreezeDB, FileFreezeDB], fs: Optional[Minio]
):
    """
    Delete the thumbnail associated with a released resource.

    Args:
        resource (Union[DatasetFreezeDB, FileFreezeDB]): file or dataset.
        fs (Optional[Minio]): The Minio file system client.
    """
    async for frozen_thumbnail in ThumbnailFreezeDB.find(
        ThumbnailFreezeDB.id == resource.thumbnail_id,
    ):
        # delete mongo document
        await frozen_thumbnail.delete()

        if fs is not None:
            # if thumbnail is not used by other frozen dataset, delete the raw bytes
            if (
                await ThumbnailFreezeDB.find_one(
                    ThumbnailFreezeDB.origin_id
                    == PydanticObjectId(frozen_thumbnail.origin_id)
                )
                is None
            ) and (
                await ThumbnailDB.find_one(ThumbnailDB.id != frozen_thumbnail.origin_id)
                is None
            ):
                fs.remove_object(
                    settings.MINIO_BUCKET_NAME, str(frozen_thumbnail.origin_id)
                )

        return frozen_thumbnail.dict()


async def _delete_thumbnail(resource: Union[DatasetDB, FileDB], fs: Optional[Minio]):
    """
    Delete the thumbnail associated with a current/latest resource.

    Args:
        resource (Union[DatasetDB, FileDB]): file or dataset.
        fs (Optional[Minio]): The Minio file system client.
    """
    async for thumbnail in ThumbnailDB.find(
        ThumbnailDB.id == resource.thumbnail_id,
    ):
        # delete mongo document
        await thumbnail.delete()

        if fs is not None:
            # if thumbnail is not used by other frozen dataset, delete the raw bytes
            if (
                await ThumbnailFreezeDB.find_one(
                    ThumbnailFreezeDB.origin_id == PydanticObjectId(thumbnail.id)
                )
                is None
            ):
                fs.remove_object(settings.MINIO_BUCKET_NAME, str(thumbnail.id))

        return thumbnail.dict()


async def _delete_file(file: FileDB, fs: Optional[Minio]):
    """
    Delete the file mongo document and raw bytes if applicable

    Args:
        file (FileDB): file .
        fs (Optional[Minio]): The Minio file system client.
    """
    # delete mongo
    await file.delete()

    if fs is not None:
        # delete file raw bytes if not used anywhere else
        if (
            await FileFreezeDB.find_one(
                FileFreezeDB.origin_id == PydanticObjectId(file.id)
            )
            is None
        ):
            fs.remove_object(settings.MINIO_BUCKET_NAME, str(file.id))

    return file.dict()


async def _delete_frozen_file(frozen_file: FileFreezeDB, fs: Optional[Minio]):
    """
    Delete the file associated with a released dataset including mongo document and raw bytes if applicable

    Args:
        frozen_file (FileFreezeDB): file associated with a released dataset.
        fs (Optional[Minio]): The Minio file system client.
    """

    # delete mongo
    await frozen_file.delete()

    if fs is not None:
        # delete file raw bytes if not used anywhere else, check both frozen and well as current
        if (
            await FileFreezeDB.find_one(
                FileFreezeDB.origin_id == PydanticObjectId(frozen_file.origin_id)
            )
            is None
        ) and (
            await FileDB.find_one(FileDB.id == PydanticObjectId(frozen_file.origin_id))
        ) is None:
            fs.remove_object(settings.MINIO_BUCKET_NAME, str(frozen_file.origin_id))

    return frozen_file.dict()


async def _delete_frozen_dataset(
    frozen_dataset: DatasetFreezeDB, fs: Optional[Minio], hard_delete: bool = False
):
    """
    Delete a released dataset, including metadata, folders, thumbnails, visualizations, and authorizations.

    Args:
        frozen_dataset (DatasetFreezeDB): Released dataset.
        fs (Optional[Minio]): The Minio file system client.
        hard_delete: Flag indicating delete bytes in minio or not.
    """
    # delete metadata
    await MetadataFreezeDB.find(
        MetadataFreezeDB.resource.resource_id == PydanticObjectId(frozen_dataset.id),
        MetadataFreezeDB.resource.collection == "datasets",
    ).delete()

    # delete folders
    await FolderFreezeDB.find(
        FolderFreezeDB.dataset_id == PydanticObjectId(frozen_dataset.id)
    ).delete()

    # delete dataset thumbnails
    await _delete_frozen_thumbnail(frozen_dataset, fs)

    # delete dataset visualization
    await _delete_frozen_visualizations(frozen_dataset, fs)

    # delete files and file associate resources
    async for frozen_file in FileFreezeDB.find(
        FileFreezeDB.dataset_id == PydanticObjectId(frozen_dataset.id)
    ):
        if frozen_file.storage_type == StorageType.LOCAL:
            await remove_frozen_local_file_entry(frozen_file.id)
        else:
            await remove_frozen_file_entry(frozen_file.id, fs)

    # delete authorizations
    await AuthorizationDB.find(
        AuthorizationDB.dataset_id == PydanticObjectId(frozen_dataset.id)
    ).delete()

    # If all above succeeded
    if hard_delete:
        await frozen_dataset.delete()
    else:
        frozen_dataset.deleted = True
        await frozen_dataset.save()

    return frozen_dataset.dict()


# TODO: Move this to MongoDB middle layer
async def remove_file_entry(
    file_id: Union[str, ObjectId],
    fs: Minio,
    es: Elasticsearch,
):
    """
    Remove a file belongs to a current/latest dataset; remove it from MongoDB, Elasticsearch, Minio, and associated
    metadata and version information.

    Args:
        file_id (Union[str, ObjectId]): The ID of the file to be removed.
        fs (Minio): The Minio file system client.
        es (Elasticsearch): The Elasticsearch client.
    """

    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # delete from elasticsearch
        delete_document_by_id(es, settings.elasticsearch_index, str(file_id))

        # TODO: Deleting individual versions will require updating version_id in mongo, or deleting entire document
        await FileVersionDB.find(FileVersionDB.file_id == ObjectId(file_id)).delete()

        # delete metadata
        await MetadataDB.find(
            MetadataDB.resource.resource_id == ObjectId(file_id),
            MetadataDB.resource.collection == "files",
        ).delete()

        # delete thumbnail
        await _delete_thumbnail(file, fs)

        # delete visualization
        await _delete_visualizations(file, fs)

        # delete file raw bytes if not used anywhere else
        await _delete_file(file, fs)

    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


async def remove_frozen_file_entry(
    frozen_file_id: Union[str, ObjectId], fs: Optional[Minio]
):
    """
    Remove a file belongs to a released dataset; remove it from MongoDB, Minio, and associated metadata
    and version information.

    Args:
        frozen_file_id (Union[str, ObjectId]): The ID of the file to be removed.
        fs (Minio): The Minio file system client.
    """
    if (
        frozen_file := await FileFreezeDB.get(PydanticObjectId(frozen_file_id))
    ) is not None:
        # delete metadata
        await MetadataFreezeDB.find(
            MetadataFreezeDB.resource.resource_id == ObjectId(frozen_file_id),
            MetadataFreezeDB.resource.collection == "files",
        ).delete()

        # delete thumbnail
        await _delete_frozen_thumbnail(frozen_file, fs)

        # delete visualization
        await _delete_frozen_visualizations(frozen_file, fs)

        # if all above succeeded, delete from mongo
        await _delete_frozen_file(frozen_file, fs)
    else:
        raise HTTPException(
            status_code=404, detail=f"Released File {frozen_file_id} not found"
        )


async def remove_local_file_entry(file_id: Union[str, ObjectId], es: Elasticsearch):
    """
    Remove a local file belongs to a current/latest dataset; remove it from MongoDB, elasticsearch, and associated
    metadata and version information.

    Args:
        file_id (Union[str, ObjectId]): The ID of the file to be removed.
        es (Elasticsearch): The Elasticsearch client.
    """
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # delete from elasticsearch
        delete_document_by_id(es, settings.elasticsearch_index, str(file_id))

        # delete metadata
        await MetadataDB.find(
            MetadataDB.resource.resource_id == PydanticObjectId(file_id)
        ).delete()

        # delete thumbnail
        await _delete_thumbnail(file, None)

        # delete visualization
        await _delete_visualizations(file, None)

        # if all above succeeded
        await _delete_file(file, None)

    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


async def remove_frozen_local_file_entry(frozen_file_id: Union[str, ObjectId]):
    """
    Remove a local file belongs to a released dataset; remove it from MongoDB, and associated
    metadata and version information.

    Args:
        frozen_file_id (Union[str, ObjectId]): The ID of the file to be removed.
    """
    if (
        frozen_file := await FileFreezeDB.get(PydanticObjectId(frozen_file_id))
    ) is not None:
        # delete metadata
        await MetadataFreezeDB.find(
            MetadataFreezeDB.resource.resource_id == PydanticObjectId(frozen_file_id)
        ).delete()

        # delete thumbnail
        await _delete_frozen_thumbnail(frozen_file, None)

        # delete visualization
        await _delete_frozen_visualizations(frozen_file, None)

        # if all above succeeded, delete from mongo
        await _delete_frozen_file(frozen_file, None)
    else:
        raise HTTPException(status_code=404, detail=f"File {frozen_file_id} not found")
