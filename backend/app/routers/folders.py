from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient

from app import dependencies

router = APIRouter()


@router.get("/{folder_id}/path")
async def download_folder(
    folder_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        folder := await db["folders"].find_one({"_id": ObjectId(folder_id)})
    ) is not None:
        path = []
        current_folder_id = folder_id
        # TODO switch to $graphLookup
        while (
            current_folder := await db["folders"].find_one(
                {"_id": ObjectId(current_folder_id)}
            )
        ) is not None:
            folder_info = {
                "folder_name": current_folder["name"],
                "folder_id": str(current_folder["_id"]),
            }
            path.insert(0, folder_info)
            current_folder_id = current_folder["parent_folder"]
        return path
    else:
        raise HTTPException(status_code=404, detail=f"File {folder_id} not found")
