from app.db.folder.version import _freeze_folder
from app.models.files import FileDB, FileFreezeDB
from app.models.folders import FolderDB
from app.models.metadata import MetadataDB, MetadataFreezeDB
from bson import ObjectId


async def _freeze_file_metadata(file, new_frozen_file_id):
    file_metadata = await MetadataDB.find(
        MetadataDB.resource.resource_id == ObjectId(file.id)
    ).to_list()
    for fm in file_metadata:
        fm_data = fm.dict()
        fm_data["origin_id"] = fm_data.pop("id")
        fm_data["resource"]["resource_id"] = new_frozen_file_id
        fm_data["frozen"] = True
        frozen_metadata = MetadataFreezeDB(**fm_data)
        await frozen_metadata.insert()


async def _freeze_files_folders_metadata(dataset_id, new_frozen_dataset_id):
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

        frozen_file = FileFreezeDB(**file_data)
        await frozen_file.insert()

        # if there are associate metadata on the file
        await _freeze_file_metadata(file, frozen_file.id)


async def _freeze_dataset_metadata(dataset_id, new_frozen_dataset_id):
    dataset_metadata = await MetadataDB.find(
        MetadataDB.resource.resource_id == ObjectId(dataset_id)
    ).to_list()
    for dm in dataset_metadata:
        dm_data = dm.dict()
        dm_data["origin_id"] = dm_data.pop("id")
        dm_data["resource"]["resource_id"] = new_frozen_dataset_id
        dm_data["frozen"] = True
        frozen_metadata = MetadataFreezeDB(**dm_data)
        await frozen_metadata.insert()
