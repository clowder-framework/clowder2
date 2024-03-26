from app.models.status import Status
from fastapi import APIRouter
from fastapi.security import HTTPBearer

router = APIRouter()
security = HTTPBearer()


@router.get("", response_model=Status)
async def get_status():
    return Status()
