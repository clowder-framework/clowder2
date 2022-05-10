import io
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    File,
    Form,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from minio import Minio
from pydantic import Json
from pymongo import MongoClient

from app import dependencies
from app.config import settings
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.users import UserOut
from app.models.extractors import ExtractorIn
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataIn,
    MetadataDB,
    MetadataOut,
)
from app.keycloak_auth import get_user, get_current_user, get_token

router = APIRouter()


@router.put("/{file_id}", response_model=FileOut)
async def update_file(
    file_id: str,
    token=Depends(get_token),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    if (file_q := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # First, add to database and get unique ID
        existing_file = FileOut.from_mongo(file_q)

        # Update file in Minio and get the new version IDs
        version_id = None
        while content := file.file.read(
            settings.MINIO_UPLOAD_CHUNK_SIZE
        ):  # async read chunk
            response = fs.put_object(
                settings.MINIO_BUCKET_NAME,
                str(existing_file.id),
                io.BytesIO(content),
                length=-1,
                part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            )  # async write chunk to minio
            version_id = response.version_id

        # Update version/creator/created flags
        updated_file = FileDB(**existing_file)
        updated_file.name = file.filename
        updated_file.creator = UserOut(**user)
        updated_file.created = datetime.utcnow()
        updated_file.version_id = version_id
        updated_file.version_num = existing_file.version_num + 1
        await db["files"].replace_one({"_id": ObjectId(file_id)}, updated_file)

        # Put entry in FileVersion collection
        new_version = FileVersion(
            version_id=updated_file.version_id,
            version_num=updated_file.version_num,
            file_id=updated_file.id,
            creator=user,
        )
        await db["file_versions"].insert_one(dict(new_version))
        return FileOut.from_mongo(updated_file)
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    # If file exists in MongoDB, download from Minio
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # Get content type & open file stream
        content = fs.get_object(settings.MINIO_BUCKET_NAME, file_id)
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % file["name"]
        )
        # Increment download count
        await db["files"].update_one(
            {"_id": ObjectId(file_id)}, {"$inc": {"downloads": 1}}
        )
        return response
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        if (
            dataset := await db["datasets"].find_one({"files": ObjectId(file_id)})
        ) is not None:
            updated_dataset = await db["datasets"].update_one(
                {"_id": ObjectId(dataset["id"])},
                {"$pull": {"files": ObjectId(file_id)}},
            )

        # TODO: Deleting individual versions may require updating version_id in mongo, or deleting entire document
        fs.remove_object(settings.MINIO_BUCKET_NAME, str(file_id))
        removed_file = await db["files"].delete_one({"_id": ObjectId(file_id)})
        removed_vers = await db["file_versions"].delete({"file_id": ObjectId(file_id)})
        return {"deleted": file_id}
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/summary")
async def get_file_summary(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # TODO: Incrementing too often (3x per page view)
        # file["views"] += 1
        # db["files"].replace_one({"_id": ObjectId(file_id)}, file)
        return FileOut.from_mongo(file)

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/versions", response_model=List[FileVersion])
async def get_file_versions(
    file_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 20,
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        """
        # DEPRECATED: Gett version information from Minio directly (no creator field)
        file_versions = []
        minio_versions = fs.list_objects(
            settings.MINIO_BUCKET_NAME,
            prefix=file_id,
            include_version=True,
        )
        for version in minio_versions:
            file_versions.append(
                {
                    "version_id": version._version_id,
                    "latest": version._is_latest,
                    "modified": version._last_modified,
                }
            )
        return file_versions
        """

        mongo_versions = []
        for ver in (
            await db["file_versions"]
            .find({"file_id": ObjectId(file_id)})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            mongo_versions.append(FileVersion.from_mongo(ver))
        return mongo_versions

    raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.post("/{file_id}/metadata", response_model=MetadataOut)
async def add_metadata(
    metadata_in: MetadataIn,
    file_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Attach new metadata to a file.

    Args:
        metadata_in: Metadata contents and associated context
        file_id: UUID of target file
        user: User who is uploading metadata or who triggered extractor
        db: MongoDB database client
    Returns:
        Metadata document that was added to database
    """
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file = FileOut(**file)
        file_version = metadata_in.file_version
        if file_version is not None:
            if (
                version_q := await db["file_versions"].find_one(
                    {"file_id": ObjectId(file_id), "version_num": file_version}
                )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File {file_id} version {file_version} does not exist",
                )
            target_version = file_version
        else:
            # Use latest version of file if none specified
            target_version = file.version_num

        file_ref = MongoDBRef(collection="files", resource_id=file.id, version=target_version)

        # Build MetadataAgent depending on whether extractor info is present
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                extractor := await db["extractors"].find_one(
                    {"_id": extractor_info.id, "version": extractor_info.version}
                )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)

        md = MetadataDB(
            **metadata_in.dict(),
            resource=file_ref,
            agent=agent,
        )
        new_metadata = await db["metadata"].insert_one(md.to_mongo())
        found = await db["metadata"].find_one({"_id": new_metadata.inserted_id})
        metadata_out = MetadataOut.from_mongo(found)
        return metadata_out


@router.get("/{file_id}/metadata", response_model=List[MetadataOut])
async def get_metadata(
    file_id: str,
    file_version: Optional[int] = Form(None),
    all_versions: Optional[bool] = False,
    extractor_name: Optional[str] = Form(None),
    extractor_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        query = {"resource.resource_id": ObjectId(file_id)}
        file = FileOut.from_mongo(file)

        if not all_versions:
            # Default to latest version
            target_version = file.version_num
            if file_version is not None:
                if (
                    version_q := await db["file_versions"].find_one(
                        {"file_id": ObjectId(file_id), "version_num": file_version}
                    )
                ) is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"File version {file_version} does not exist",
                    )
                target_version = file_version
            query["resource.version"] = target_version
        if extractor_name is not None:
            query["agent.extractor.name"] = extractor_name
        if extractor_version is not None:
            query["agent.extractor.version"] = extractor_version

        metadata = []
        async for md in db["metadata"].find(query):
            metadata.append(MetadataOut.from_mongo(md))
        return metadata
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
