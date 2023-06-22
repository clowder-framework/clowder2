import mimetypes

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.datastructures import UploadFile
from fastapi.param_functions import File

from minio import Minio

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user
from app.models.files import FileContentType

from app.models.visualization import VisualizationOut, VisualizationIn, VisualizationDB

router = APIRouter()


@router.post("", response_model=VisualizationOut)
async def add_visualization(
    viz_data_in: VisualizationIn,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    data: UploadFile = File(...),
):
    """Insert VisualizationDataDB object into MongoDB (makes Clowder ID), then Minio.

    Arguments:
        viz_db: VisualizationDataDB object in db
        data: bytes to upload
    """

    # Check all connection and abort if any one of them is not available
    if fs is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    viz_data_db = VisualizationDB(**viz_data_in.dict(), creator=user.email)
    viz_data_db.content_type = data.content_type

    if viz_data_db.content_type is None:
        content_type = mimetypes.guess_type(data.name)
        content_type = content_type[0] if len(content_type) > 1 else content_type
    type_main = content_type.split("/")[0] if type(content_type) is str else "N/A"
    viz_data_db.content_type = FileContentType(
        content_type=content_type, main_type=type_main
    )

    await viz_data_db.insert()
    new_viz_data_id = viz_data_db.id

    # Use unique ID as key for Minio and get initial version ID
    response = fs.put_object(
        settings.MINIO_BUCKET_NAME,
        str(new_viz_data_id),
        data.file,
        length=-1,
        part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
    )  # async write chunk to minio
    viz_data_db.bytes = len(
        fs.get_object(settings.MINIO_BUCKET_NAME, str(new_viz_data_id)).data
    )
    await viz_data_db.replace()


@router.get("/{visualization_id}", response_model=VisualizationOut)
async def get_group(visualization_id: str):
    if (
        visualization := await VisualizationDB.get(PydanticObjectId(visualization_id))
    ) is not None:
        return visualization.dict()
    raise HTTPException(status_code=404, detail=f"Group {visualization_id} not found")
