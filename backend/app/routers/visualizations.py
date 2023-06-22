import mimetypes

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi import (
    File,
    UploadFile,
    Response,
    Request,
    Form
)

from minio import Minio

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user
from app.models.files import FileContentType

from app.models.visualizations import VisualizationsOut, VisualizationsIn, VisualizationsDB

router = APIRouter()


@router.post("", response_model=VisualizationsOut)
async def add_Visualizations(
    visualization_in: VisualizationsIn,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...)
):
    """Insert VisualizationsDataDB object into MongoDB (makes Clowder ID), then Minio.

    Arguments:
        visualization_in: VisualizationsIN object from user input
        data: bytes to upload
    """

    print("check:", visualization_in)
    # Check all connection and abort if any one of them is not available
    if fs is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    visualization_db = VisualizationsDB(**visualization_in.dict(), creator=user.email)
    visualization_db.content_type = file.content_type

    if visualization_db.content_type is None:
        content_type = mimetypes.guess_type(file.name)
        content_type = content_type[0] if len(content_type) > 1 else content_type
    type_main = content_type.split("/")[0] if type(content_type) is str else "N/A"
    visualization_db.content_type = FileContentType(
        content_type=content_type, main_type=type_main
    )

    await visualization_db.insert()
    visualization_id = visualization_db.id

    # Use unique ID as key for Minio and get initial version ID
    response = fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(visualization_id),
        file.file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
    )  # async write chunk to minio
    visualization_db.bytes = len(
        fs.get_object(settings.MINIO_BUCKET_NAME, str(visualization_id)).data
    )
    await visualization_db.replace()

    return visualization_db.id


@router.get("/{visualization_id}", response_model=VisualizationsOut)
async def get_visualization(visualization_id: str):
    if (
        visualization := await VisualizationsDB.get(PydanticObjectId(visualization_id))
    ) is not None:
        return visualization.dict()
    raise HTTPException(status_code=404, detail=f"Group {visualization_id} not found")
