import io
from datetime import datetime
from typing import Optional, List

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from pymongo import MongoClient

from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.models.pyobjectid import PyObjectId
from app.models.listeners import ListenerOut

router = APIRouter()


@router.get("/", response_model=ListenerOut)
async def get_listeners(
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    pass

@router.delete("/{listener_id}")
async def delete_listener(
        listener_id: str,
        user=Depends(get_current_user),
        db: MongoClient = Depends(dependencies.get_db),
):
    pass

