from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi import File, UploadFile, Response, Request, Form

from minio import Minio
from starlette.responses import StreamingResponse

from app import dependencies
from app.config import settings
from app.keycloak_auth import get_current_user

from app.models.visualization import VisualizationOut, VisualizationIn, VisualizationDB
from app.routers.utils import get_content_type

router = APIRouter()


@router.post("", response_model=VisualizationOut)
async def add_Visualization(
    name: str,
    description: str,
    user=Depends(get_current_user),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    """Insert VisualizationsDataDB object into MongoDB (makes Clowder ID), then Minio.

    Arguments:
        name: name of visualization data
        description: description of visualization data
        file: bytes to upload
    """
    visualization_in = VisualizationIn(name=name, description=description)

    # Check all connection and abort if any one of them is not available
    if fs is None:
        raise HTTPException(status_code=503, detail="Service not available")
        return

    visualization_db = VisualizationDB(**visualization_in.dict(), creator=user)
    await visualization_db.insert()
    visualization_db.content_type = get_content_type(file.content_type, file.file)
    visualization_id = visualization_db.id

    # Use unique ID as key for Minio
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

    return visualization_db.dict()


@router.get("/{visualization_id}", response_model=VisualizationOut)
async def get_visualization(visualization_id: str):
    if (
        visualization := await VisualizationDB.get(PydanticObjectId(visualization_id))
    ) is not None:
        return visualization.dict()
    raise HTTPException(
        status_code=404, detail=f"Visualization {visualization_id} not found"
    )


@router.delete("/{visualization_id}")
async def remove_visualization(
    visualization_id: str, fs: Minio = Depends(dependencies.get_fs)
):
    if (
        visualization := await VisualizationDB.get(PydanticObjectId(visualization_id))
    ) is not None:
        fs.remove_object(settings.MINIO_BUCKET_NAME, visualization_id)
        visualization.delete()
        return
    raise HTTPException(
        status_code=404, detail=f"Visualization {visualization_id} not found"
    )


@router.get("/download/{visualization_id}")
async def download_visualization(
    visualization_id: str, fs: Minio = Depends(dependencies.get_fs)
):
    # If visualization exists in MongoDB, download from Minio
    if (
        visualization := await VisualizationDB.get(PydanticObjectId(visualization_id))
    ) is not None:
        content = fs.get_object(settings.MINIO_BUCKET_NAME, visualization_id)

        # Get content type & open file stream
        response = StreamingResponse(content.stream(settings.MINIO_UPLOAD_CHUNK_SIZE))
        response.headers["Content-Disposition"] = (
            "attachment; filename=%s" % visualization.name
        )
        return response
    else:
        raise HTTPException(
            status_code=404, detail=f"Visualization {visualization_id} not found"
        )
