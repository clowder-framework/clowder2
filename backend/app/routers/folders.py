from typing import Union

from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from minio import Minio
from pymongo import MongoClient

from app import dependencies
from app.routers.files import remove_file_entry
from app.models.files import FileOut

router = APIRouter()


async def remove_folder_entry(
    folder_id: Union[str, ObjectId],
    db: MongoClient,
):
    """Remove FolderDB object into MongoDB"""
    if (await db["folders"].find_one({"_id": ObjectId(folder_id)})) is not None:
        await db["folders"].delete_one({"_id": ObjectId(folder_id)})


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


@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (await db["folders"].find_one({"_id": ObjectId(folder_id)})) is not None:
        # delete child folders and files in child folders
        current_folder_id = folder_id
        while (
                current_folder := await db["folders"].find_one(
                    {"_id": ObjectId(current_folder_id)}
                )
        ) is not None:
            # delete current folder
            await remove_folder_entry(current_folder_id, db)
            # delete files in current folder
            async for file in db["files"].find({"folder_id": ObjectId(current_folder_id)}):
                file = FileOut(**file)
                await remove_file_entry(file.id, db, fs)
            current_folder_id = current_folder["parent_folder"]

        return {"deleted": folder_id}
    else:
        raise HTTPException(status_code=404, detail=f"Folder {folder_id} not found")
