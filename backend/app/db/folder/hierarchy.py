import os

from app.models.folders import FolderDBViewList
from beanie import PydanticObjectId


async def _get_folder_hierarchy(
    folder_id: str,
    hierarchy: str,
):
    """Generate a string of nested path to folder for use in zip file creation."""
    folder = await FolderDBViewList.find_one(
        FolderDBViewList.id == PydanticObjectId(folder_id)
    )
    hierarchy = os.path.join(folder.name, hierarchy)
    if folder.parent_folder is not None:
        hierarchy = await _get_folder_hierarchy(folder.parent_folder, hierarchy)
    return hierarchy
