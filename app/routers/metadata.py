import io
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from bson.dbref import DBRef
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from minio import Minio
from pydantic import Json
from pymongo import MongoClient

from app import dependencies
from app.auth import AuthHandler
from app.config import settings
from app.models.files import FileIn, FileOut, FileVersion
from app.models.users import UserOut

router = APIRouter()

auth_handler = AuthHandler()
