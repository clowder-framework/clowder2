from app.db.folder.version import _freeze_folder
from app.models.files import FileDB, FileFreezeDB
from app.models.folders import FolderDB
from app.models.metadata import MetadataDB, MetadataFreezeDB
from app.models.thumbnails import ThumbnailDB, ThumbnailFreezeDB
from app.models.visualization_config import (
    VisualizationConfigDB,
    VisualizationConfigFreezeDB,
)
from app.models.visualization_data import VisualizationDataDB, VisualizationDataFreezeDB
from beanie import PydanticObjectId
from beanie.odm.operators.find.logical import And
from bson import ObjectId


async def _freeze_file_metadata(file, new_frozen_file_id: PydanticObjectId):
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
    file_thumbnail = await ThumbnailDB.get(PydanticObjectId(thumbnail_id))
    file_thumbnail_data = file_thumbnail.dict()
    file_thumbnail_data["origin_id"] = file_thumbnail_data.pop("id")
    file_thumbnail_data["frozen"] = True
    frozen_file_thumbnail = ThumbnailFreezeDB(**file_thumbnail_data)
    await frozen_file_thumbnail.insert()

    return frozen_file_thumbnail.id


async def _freeze_file_visualization(file, new_frozen_file_id: PydanticObjectId):
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
