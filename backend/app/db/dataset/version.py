from app.models.files import FileDB, FileFreezeDB
from app.models.folders import FolderDB, FolderFreezeDB
from app.models.metadata import MetadataDB, MetadataFreezeDB
from beanie import PydanticObjectId
from bson import ObjectId


async def _freeze_folder(folder, new_frozen_dataset_id, parent_id_map=None):
    if parent_id_map is None:
        parent_id_map = {}

    folder_data = folder.dict()
    original_id = folder_data.pop("id")
    folder_data["origin_id"] = original_id
    folder_data["dataset_id"] = new_frozen_dataset_id
    folder_data["frozen"] = True

    # recursively freeze the parent folder
    if folder_data["parent_folder"]:
        parent_folder_id = folder_data["parent_folder"]
        if parent_folder_id in parent_id_map:
            # Use the new frozen parent folder id if already frozen
            folder_data["parent_folder"] = parent_id_map[parent_folder_id]
        else:
            # Retrieve and freeze the parent folder if not already processed
            parent_folder = await FolderDB.get(PydanticObjectId(parent_folder_id))
            frozen_parent_folder = await _freeze_folder(
                parent_folder, new_frozen_dataset_id, parent_id_map
            )
            # Update the folder data with the new frozen parent folder id
            folder_data["parent_folder"] = frozen_parent_folder.id
            # Add to the parent_id_map
            parent_id_map[parent_folder_id] = frozen_parent_folder.id

    frozen_folder = FolderFreezeDB(**folder_data)
    await frozen_folder.insert()

    # Map the original id to the new frozen folder id
    parent_id_map[original_id] = frozen_folder.id

    return frozen_folder


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
    files = await FileDB.find(FileDB.dataset_id == ObjectId(dataset_id)).to_list()
    folders = await FolderDB.find(FolderDB.dataset_id == ObjectId(dataset_id)).to_list()
    for file in files:
        file_data = file.dict()
        file_data["origin_id"] = file_data.pop("id")
        file_data["dataset_id"] = new_frozen_dataset_id
        file_data["frozen"] = True

        # if file belongs to a folder
        # freeze the folder first
        # then update the folder_id to the new frozen folder id
        if file_data["folder_id"]:
            folder = await FolderDB.get(PydanticObjectId(file_data["folder_id"]))
            frozen_folder = await _freeze_folder(folder, new_frozen_dataset_id)
            file_data["folder_id"] = frozen_folder.id

        frozen_file = FileFreezeDB(**file_data)
        await frozen_file.insert()

        # if there are associate metadata on the file
        await _freeze_file_metadata(file, frozen_file.id)

    # recursively freeze folders without files
    for folder in folders:
        await _freeze_folder(folder, new_frozen_dataset_id)


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
