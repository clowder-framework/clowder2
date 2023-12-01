from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.models.folders import FolderDB

router = APIRouter()


@router.get("/{folder_id}/path")
async def download_folder(
    folder_id: str,
):
    folder = await FolderDB.get(PydanticObjectId(folder_id))
    if folder is not None:
        path = []
        current_folder_id = folder_id
        # TODO switch to $graphLookup
        while (
            current_folder := await FolderDB.find_one(
                FolderDB.id == ObjectId(current_folder_id)
            )
        ) is not None:
            folder_info = {
                "folder_name": current_folder.name,
                "folder_id": str(current_folder.id),
            }
            path.insert(0, folder_info)
            current_folder_id = current_folder.parent_folder
        return path
    else:
        raise HTTPException(status_code=404, detail=f"File {folder_id} not found")
