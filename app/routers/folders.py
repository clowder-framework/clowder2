from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient

from app import dependencies
from app.auth import AuthHandler

router = APIRouter()

auth_handler = AuthHandler()


@router.get("/{folder_id}/path")
async def download_file(
    folder_id: str,
    user_id=Depends(auth_handler.auth_wrapper),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        folder := await db["folders"].find_one({"_id": ObjectId(folder_id)})
    ) is not None:
        path = []
        current_folder_id = folder_id
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
