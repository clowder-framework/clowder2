import io
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Form,
)
from pymongo import MongoClient

from app import dependencies
from app.config import settings
from app.models.files import FileOut
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataDefinitionOut,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_definition,
    validate_context,
    patch_metadata
)
from app.keycloak_auth import get_user, get_current_user, get_token, UserOut

router = APIRouter()


async def _build_metadata_db_obj(db: MongoClient, metadata_in: MetadataIn, file: FileOut, user: UserOut,
                                 agent: MetadataAgent = None, version: int = None):
    """Convenience function for building a MetadataDB object from incoming metadata plus a file. Agent and file version
    will be determined based on inputs if they are not provided directly."""
    contents = await validate_context(db, metadata_in.contents,
                                      metadata_in.definition, metadata_in.context_url, metadata_in.context)

    if version is None:
        # Validate specified version, or use latest by default
        file_version = metadata_in.file_version
        if file_version is not None:
            if (await db["file_versions"].find_one(
                        {"file_id": file.id, "version_num": file_version})
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {file_version} does not exist",
                )
            target_version = file_version
        else:
            # Use latest version of file if none specified
            target_version = file.version_num
    else:
        # Assume version has already been validated elsewhere if it is passed in
        target_version = version

    if agent is None:
        # Build MetadataAgent depending on whether extractor info is present/valid
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                    extractor := await db["extractors"].find_one(
                        {"name": extractor_info.name, "version": extractor_info.version}
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)

    file_ref = MongoDBRef(collection="files", resource_id=file.id, version=target_version)

    # Apply any typecast fixes from definition validation
    metadata_in = metadata_in.dict()
    metadata_in["contents"] = contents
    return MetadataDB(
        **metadata_in,
        resource=file_ref,
        agent=agent,
    )


@router.post("/{file_id}/metadata", response_model=MetadataOut)
async def add_file_metadata(
    metadata_in: MetadataIn,
    file_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Attach new metadata to a file. The body must include a contents field with the JSON metadata, and either a
    context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.

    Returns:
        Metadata document that was added to database
    """
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        file = FileOut(**file)
        # If dataset already has metadata using this definition, don't allow duplication
        definition = metadata_in.definition
        if definition is not None:
            existing_q = {
                "resource.resource_id": file.id,
                "definition": definition
            }
            # Extracted metadata doesn't care about user
            if metadata_in.extractor_info is not None:
                existing_q["agent.extractor.name"] = metadata_in.extractor_info.name
                existing_q["agent.extractor.version"] = metadata_in.extractor_info.version
            else:
                existing_q["agent.creator.id"] = user.id
            if (existing := await db["metadata"].find_one(existing_q)) is not None:
                raise HTTPException(409, f"Metadata for {definition} already exists on this file")

        md = await _build_metadata_db_obj(db, metadata_in, file, user)
        new_metadata = await db["metadata"].insert_one(md.to_mongo())
        found = await db["metadata"].find_one({"_id": new_metadata.inserted_id})
        metadata_out = MetadataOut.from_mongo(found)
        return metadata_out


@router.put("/{file_id}/metadata", response_model=MetadataOut)
async def replace_file_metadata(
        metadata_in: MetadataPatch,
        file_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    """Replace metadata, including agent and context. If only metadata contents should be updated, use PATCH instead.

    Returns:
        Metadata document that was updated
    """
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        # First, make sure the metadata we are replacing actually exists.
        query = {"resource.resource_id": ObjectId(file_id)}
        file = FileOut(**file)

        version = metadata_in.file_version
        if version is not None:
            if (
                    version_q := await db["file_versions"].find_one(
                        {"file_id": ObjectId(file_id), "version_num": version}
                    )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {version} does not exist",
                )
            target_version = version
        else:
            target_version = file.version_num
        query["resource.version"] = target_version

        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                    extractor := await db["extractors"].find_one(
                        {"name": extractor_info.name, "version": extractor_info.version}
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user...
                query["agent.extractor.name"] = agent.extractor.name
                query["agent.extractor.version"] = agent.extractor.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query["agent.creator.id"] = agent.creator.id

        if (md := await db["metadata"].find_one(query)) is not None:
            # Metadata exists, so prepare the new document we are going to replace it with
            md_obj = _build_metadata_db_obj(db, metadata_in, file, agent=agent, version=target_version)
            new_metadata = await db["metadata"].replace_one(
                {"_id": md["_id"]},
                md_obj.to_mongo())
            found = await db["metadata"].find_one({"_id": md["_id"]})
            metadata_out = MetadataOut.from_mongo(found)
            return metadata_out
        else:
            raise HTTPException(status_code=404, detail=f"No metadata found to update")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.patch("/{file_id}/metadata", response_model=MetadataOut)
async def update_file_metadata(
    metadata_in: MetadataPatch,
    file_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        query = {"resource.resource_id": ObjectId(file_id)}
        file = FileOut(**file)
        contents = metadata_in.contents

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            if (existing_md := await db["metadata"].find_one({"_id": ObjectId(metadata_in.metadata_id)})) is not None:
                contents = await validate_context(db, metadata_in.contents,
                                              existing_md.definition, existing_md.context_url, existing_md.context)
                query["_id"] = metadata_in.metadata_id
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query["definition"] = definition

        version = metadata_in.file_version
        if version is not None:
            if (
                version_q := await db["file_versions"].find_one(
                    {"file_id": ObjectId(file_id), "version_num": version}
                )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {version} does not exist",
                )
            target_version = version
        else:
            target_version = file.version_num
        query["resource.version"] = target_version

        # Filter by MetadataAgent
        extractor_info = metadata_in.extractor_info
        if extractor_info is not None:
            if (
                    extractor := await db["extractors"].find_one(
                        {"name": extractor_info.name, "version": extractor_info.version}
                    )
            ) is not None:
                agent = MetadataAgent(creator=user, extractor=extractor)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user

                query["agent.extractor.name"] = agent.extractor.name
                query["agent.extractor.version"] = agent.extractor.version
            else:
                raise HTTPException(status_code=404, detail=f"Extractor not found")
        else:
            # Don't apply user filter on a PATCH
            #agent = MetadataAgent(creator=user)
            #query["agent.creator.id"] = agent.creator.id
            pass

        if (md := await db["metadata"].find_one(query)) is not None:
            # TODO: Refactor this with permissions checks etc.
            result = await patch_metadata(md, contents, db)
            return result
        else:
            raise HTTPException(status_code=404, detail=f"No metadata found to update")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/metadata", response_model=List[MetadataOut])
async def get_file_metadata(
    file_id: str,
    version: Optional[int] = Form(None),
    all_versions: Optional[bool] = False,
    definition: Optional[str] = Form(None),
    extractor_name: Optional[str] = Form(None),
    extractor_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    """Get file metadata."""
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        query = {"resource.resource_id": ObjectId(file_id)}
        file = FileOut.from_mongo(file)

        # Validate specified version, or use latest by default
        if not all_versions:
            if version is not None:
                if (
                    version_q := await db["file_versions"].find_one(
                        {"file_id": ObjectId(file_id), "version_num": version}
                    )
                ) is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"File version {version} does not exist",
                    )
                target_version = version
            else:
                target_version = file.version_num
            query["resource.version"] = target_version

        if definition is not None:
            # TODO: Check if definition exists in database and raise error if not
            query["definition"] = definition

        if extractor_name is not None:
            query["agent.extractor.name"] = extractor_name
        if extractor_version is not None:
            query["agent.extractor.version"] = extractor_version

        metadata = []
        async for md in db["metadata"].find(query):
            md_out = MetadataOut.from_mongo(md)
            if md_out.definition is not None:
                if (md_def := await db["metadata.definitions"].find_one({"name": md_out.definition})) is not None:
                    md_def = MetadataDefinitionOut(**md_def)
                    md_out.description = md_def.description
            metadata.append(md_out)
        return metadata
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}/metadata", response_model=List[MetadataOut])
async def delete_file_metadata(
    file_id: str,
    version: Optional[int] = Form(None),
    extractor_name: Optional[str] = Form(None),
    extractor_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (file := await db["files"].find_one({"_id": ObjectId(file_id)})) is not None:
        query = {"resource.resource_id": ObjectId(file_id)}
        file = FileOut.from_mongo(file)

        # Validate specified version, or use latest by default
        if version is not None:
            if (
                version_q := await db["file_versions"].find_one(
                    {"file_id": ObjectId(file_id), "version_num": version}
                )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {version} does not exist",
                )
            target_version = version
        else:
            target_version = file.version_num
        query["resource.version"] = target_version

        if extractor_name is not None:
            query["agent.extractor.name"] = extractor_name
        if extractor_version is not None:
            query["agent.extractor.version"] = extractor_version

        if (md := await db["metadata"].find_one(query)) is not None:
            db["metadata"].remove({"_id": md["_id"]})
            return 200
        else:
            raise HTTPException(status_code=404, detail=f"No metadata found with that criteria")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
