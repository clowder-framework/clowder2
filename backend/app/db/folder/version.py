from app.models.folders import FolderDB, FolderFreezeDB
from beanie import PydanticObjectId


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


async def _freeze_folders(folders, new_frozen_dataset_id):
    parent_id_map = {}
    for folder in folders:
        await _freeze_folder(folder, new_frozen_dataset_id, parent_id_map)
        return parent_id_map
