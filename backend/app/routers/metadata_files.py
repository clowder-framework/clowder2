from typing import List, Optional

from app import dependencies
from app.config import settings
from app.deps.authorization_deps import FileAuthorization
from app.keycloak_auth import UserOut, get_current_user
from app.models.files import FileDB, FileDBViewList, FileOut, FileVersionDB
from app.models.listeners import EventListenerDB
from app.models.metadata import (
    MetadataAgent,
    MetadataDB,
    MetadataDBViewList,
    MetadataDefinitionDB,
    MetadataDefinitionOut,
    MetadataDelete,
    MetadataIn,
    MetadataOut,
    MetadataPatch,
    MongoDBRef,
    patch_metadata,
    validate_context,
)
from app.search.connect import delete_document_by_id
from app.search.index import index_file
from beanie import PydanticObjectId
from beanie.operators import Or
from bson import ObjectId
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, Form, HTTPException

router = APIRouter()


async def _build_metadata_db_obj(
    metadata_in: MetadataIn,
    file: FileOut,
    user: UserOut,
    agent: MetadataAgent = None,
    version: int = None,
):
    """Convenience function for building a MetadataDB object from incoming metadata plus a file. Agent and file version
    will be determined based on inputs if they are not provided directly."""
    content = await validate_context(
        metadata_in.content,
        metadata_in.definition,
        metadata_in.context_url,
        metadata_in.context,
    )

    if version is None:
        # Validate specified version, or use latest by default
        file_version = metadata_in.file_version
        if file_version is not None and file_version > 0:
            if (
                await FileVersionDB.find_one(
                    Or(
                        FileVersionDB.file_id == ObjectId(file.id),
                        FileVersionDB.file_id == file.origin_id,
                    ),
                    FileVersionDB.version_num == file_version,
                )
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
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            agent = MetadataAgent(creator=user)

    file_ref = MongoDBRef(
        collection="files", resource_id=file.id, version=target_version
    )

    # Apply any typecast fixes from definition validation
    metadata_in = metadata_in.dict()
    metadata_in["content"] = content
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
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("uploader")),
):
    """Attach new metadata to a file. The body must include a contents field with the JSON metadata, and either a
    context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.

    Returns:
        Metadata document that was added to database
    """
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        current_file_version = file.version_num
        # if metadata does not already specify a version, change metadata_in version to match current file version
        if metadata_in.file_version is None:
            metadata_in.file_version = current_file_version

        # If dataset already has metadata using this definition, don't allow duplication
        definition = metadata_in.definition
        if definition is not None:
            existing_q = [
                MetadataDB.resource.resource_id == file.id,
                MetadataDB.definition == definition,
            ]
            # Extracted metadata doesn't care about user
            if metadata_in.listener is not None:
                existing_q.append(
                    MetadataDB.agent.listener.name == metadata_in.listener.name
                )
                existing_q.append(
                    MetadataDB.agent.listener.version == metadata_in.listener.version
                )
            else:
                existing_q.append(MetadataDB.agent.creator.id == user.id)
            if (existing := await MetadataDB.find_one(*existing_q)) is not None:
                # Allow creating duplicate entry only if the file version is different
                if existing.resource.version == metadata_in.file_version:
                    raise HTTPException(
                        409, f"Metadata for {definition} already exists on this file"
                    )

        md = await _build_metadata_db_obj(metadata_in, FileOut(**file.dict()), user)
        await md.insert()

        # Add an entry to the metadata index
        await index_file(es, FileOut(**file.dict()), update=True)
        return md.dict()


@router.put("/{file_id}/metadata", response_model=MetadataOut)
async def replace_file_metadata(
    metadata_in: MetadataPatch,
    file_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("editor")),
):
    """Replace metadata, including agent and context. If only metadata contents should be updated, use PATCH instead.

    Returns:
        Metadata document that was updated
    """
    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        # First, make sure the metadata we are replacing actually exists.
        query = [MetadataDB.resource.resource_id == PydanticObjectId(file_id)]

        version = metadata_in.file_version
        if version is not None:
            if (
                await FileVersionDB.find_one(
                    Or(
                        FileVersionDB.file_id == PydanticObjectId(file_id),
                        FileVersionDB.file_id == file.origin_id,
                    ),
                    FileVersionDB.version_num == version,
                )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {version} does not exist",
                )
            target_version = version
        else:
            target_version = file.version_num

        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user...
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        if (orig_md := await MetadataDB.find_one(*query)) is not None:
            # Metadata exists, so prepare the new document we are going to replace it with
            md = await _build_metadata_db_obj(
                metadata_in,
                FileOut(**file.dict()),
                user,
                agent=agent,
                version=target_version,
            )
            md.id = orig_md.id
            await md.save()

            # Update entry to the metadata index
            await index_file(es, FileOut(**file.dict()), update=True)
            return md.dict()
        else:
            raise HTTPException(status_code=404, detail="No metadata found to update")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.patch("/{file_id}/metadata", response_model=MetadataOut)
async def update_file_metadata(
    metadata_in: MetadataPatch,
    file_id: str,
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("editor")),
):
    """Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
    agent should be changed, use PUT.

    Returns:
        Metadata document that was updated
    """

    # check if metadata with file version exists, replace metadata if none exists
    if (
        await MetadataDB.find_one(
            MetadataDB.resource.resource_id == PydanticObjectId(file_id),
            MetadataDB.resource.version == metadata_in.file_version,
        )
    ) is None:
        result = await replace_file_metadata(metadata_in, file_id, user, es)
        return result

    if (file := await FileDB.get(PydanticObjectId(file_id))) is not None:
        query = [MetadataDB.resource.resource_id == PydanticObjectId(file_id)]
        content = metadata_in.content

        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, validate the patch against existing context
            if (
                existing_md := await MetadataDB.find_one(
                    MetadataDB.id == PydanticObjectId(metadata_in.metadata_id)
                )
            ) is not None:
                content = await validate_context(
                    metadata_in.content,
                    existing_md.definition,
                    existing_md.context_url,
                    existing_md.context,
                )
                query.append(MetadataDB.id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter (don't validate yet, as patched data doesn't require completeness)
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        if metadata_in.file_version is not None:
            if (
                await FileVersionDB.find_one(
                    Or(
                        FileVersionDB.file_id == PydanticObjectId(file_id),
                        FileVersionDB.file_id == file.origin_id,
                    ),
                    FileVersionDB.version_num == metadata_in.file_version,
                )
            ) is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"File version {metadata_in.file_version} does not exist",
                )
            target_version = metadata_in.file_version
        else:
            target_version = file.version_num
        query.append(MetadataDB.resource.version == target_version)

        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            # Don't apply user filter on a PATCH
            # agent = MetadataAgent(creator=user)
            # query["agent.creator.id"] = agent.creator.id
            pass

        md = await MetadataDB.find_one(query)
        if md:
            await index_file(es, FileOut(**file.dict()), update=True)
            return await patch_metadata(md, content, es)
        else:
            raise HTTPException(status_code=404, detail="No metadata found to update")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.get("/{file_id}/metadata", response_model=List[MetadataOut])
async def get_file_metadata(
    file_id: str,
    version: Optional[int] = None,
    all_versions: Optional[bool] = False,
    definition: Optional[str] = Form(None),
    listener_name: Optional[str] = Form(None),
    listener_version: Optional[float] = Form(None),
    user=Depends(get_current_user),
    allow: bool = Depends(FileAuthorization("viewer")),
):
    """Get file metadata."""
    if (
        file := await FileDBViewList.find_one(
            FileDBViewList.id == PydanticObjectId(file_id)
        )
    ) is not None:
        query = [MetadataDBViewList.resource.resource_id == PydanticObjectId(file_id)]

        # Validate specified version, or use latest by default
        if not all_versions:
            if version is not None and version > 0:
                if (
                    await FileVersionDB.find_one(
                        Or(
                            FileVersionDB.file_id == PydanticObjectId(file_id),
                            FileVersionDB.file_id == file.origin_id,
                        ),
                        FileVersionDB.version_num == version,
                    )
                ) is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"File version {version} does not exist",
                    )
                target_version = version
            else:
                target_version = file.version_num
            query.append(MetadataDBViewList.resource.version == target_version)

        if definition is not None:
            # TODO: Check if definition exists in database and raise error if not
            query.append(MetadataDBViewList.definition == definition)

        if listener_name is not None:
            query.append(MetadataDBViewList.agent.extractor.name == listener_name)
        if listener_version is not None:
            query.append(MetadataDBViewList.agent.extractor.version == listener_version)

        metadata = []
        async for md in MetadataDBViewList.find(*query):
            if md.definition is not None:
                if (
                    md_def := await MetadataDefinitionDB.find_one(
                        MetadataDefinitionDB.name == md.definition
                    )
                ) is not None:
                    md_def = MetadataDefinitionOut(**md_def.dict())
                    md.description = md_def.description
            metadata.append(md.dict())
        return metadata
    else:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")


@router.delete("/{file_id}/metadata", response_model=MetadataOut)
async def delete_file_metadata(
    metadata_in: MetadataDelete,
    file_id: str,
    # version: Optional[int] = Form(None),
    user=Depends(get_current_user),
    es: Elasticsearch = Depends(dependencies.get_elasticsearchclient),
    allow: bool = Depends(FileAuthorization("editor")),
):
    if (await FileDB.get(PydanticObjectId(file_id))) is not None:
        query = [MetadataDB.resource.resource_id == PydanticObjectId(file_id)]

        # # Validate specified version, or use latest by default
        # if version is not None:
        #     if (
        #         version_q := await FileVersionDB.find_one(
        #             FileVersionDB.file_id == PydanticObjectId(file_id),
        #             FileVersionDB.version_num == version,
        #         )
        #     ) is None:
        #         raise HTTPException(
        #             status_code=404,
        #             detail=f"File version {version} does not exist",
        #         )
        #     target_version = version
        # else:
        #     target_version = file.version_num
        # query["resource.version"] = target_version

        # filter by metadata_id or definition
        if metadata_in.metadata_id is not None:
            # If a specific metadata_id is provided, delete the matching entry
            if (
                await MetadataDB.find_one(
                    MetadataDB.metadata_id == PydanticObjectId(metadata_in.metadata_id)
                )
            ) is not None:
                query.append(MetadataDB.metadata_id == metadata_in.metadata_id)
        else:
            # Use provided definition name as filter
            # TODO: Should context_url also be unique to the file version?
            definition = metadata_in.definition
            if definition is not None:
                query.append(MetadataDB.definition == definition)

        # if extractor info is provided
        # Filter by MetadataAgent
        if metadata_in.listener is not None:
            listener = await EventListenerDB.find_one(
                EventListenerDB.name == metadata_in.listener.name,
                EventListenerDB.version == metadata_in.listener.version,
            )
            if listener:
                agent = MetadataAgent(creator=user, listener=listener)
                # TODO: How do we handle two different users creating extractor metadata? Currently we ignore user
                query.append(MetadataDB.agent.listener.name == agent.listener.name)
                query.append(
                    MetadataDB.agent.listener.version == agent.listener.version
                )
            else:
                raise HTTPException(status_code=404, detail="Extractor not found")
        else:
            agent = MetadataAgent(creator=user)
            query.append(MetadataDB.agent.creator.id == agent.creator.id)

        # delete from elasticsearch
        delete_document_by_id(
            es, settings.elasticsearch_index, str(metadata_in.metadata_id)
        )

        if (md := await MetadataDB.find_one(*query)) is not None:
            await md.delete()
            return md.dict()  # TODO: Do we need to return the object we just deleted?
        else:
            raise HTTPException(
                status_code=404, detail="No metadata found with that criteria"
            )
    raise HTTPException(status_code=404, detail=f"File {file_id} not found")
