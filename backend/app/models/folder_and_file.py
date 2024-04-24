from datetime import datetime
from typing import List, Optional

from app.models.authorization import AuthorizationDB
from app.models.files import ContentType, FileBaseCommon, FileDB
from app.models.users import UserOut
from beanie import PydanticObjectId, View
from pydantic import Field


class FolderFileViewList(View, FileBaseCommon):
    # common field
    object_type: str = Field(None, alias="object_type")  # necessary for Views
    id: PydanticObjectId = Field(None, alias="_id")  # necessary for Views
    dataset_id: PydanticObjectId
    creator: UserOut
    created: datetime = Field(default_factory=datetime.utcnow)
    modified: datetime = Field(default_factory=datetime.utcnow)
    name: str = "N/A"

    # file
    version_id: str = "N/A"
    version_num: int = 0
    folder_id: Optional[PydanticObjectId]
    auth: List[AuthorizationDB]
    bytes: int = 0
    content_type: ContentType = ContentType()
    thumbnail_id: Optional[PydanticObjectId] = None

    # folder
    parent_folder: Optional[PydanticObjectId]
    auth: List[AuthorizationDB]

    # for dataset versioning
    origin_id: Optional[PydanticObjectId] = None
    frozen: bool = False

    class Settings:
        source = FileDB
        name = "folders_files_view"
        pipeline = [
            {
                "$addFields": {
                    "object_type": "file",
                    "frozen": False,
                    "origin_id": "$_id",
                }
            },
            {
                "$unionWith": {
                    "coll": "folders",
                    "pipeline": [
                        {
                            "$addFields": {
                                "object_type": "folder",
                                "frozen": False,
                                "origin_id": "$_id",
                            }
                        }
                    ],
                }
            },
            {
                "$unionWith": {
                    "coll": "files_freeze",
                    "pipeline": [
                        {"$addFields": {"object_type": "file", "frozen": True}}
                    ],
                }
            },
            {
                "$unionWith": {
                    "coll": "folders_freeze",
                    "pipeline": [
                        {"$addFields": {"object_type": "folder", "frozen": True}}
                    ],
                }
            },
            {
                "$lookup": {
                    "from": "authorization",
                    "localField": "dataset_id",
                    "foreignField": "dataset_id",
                    "as": "auth",
                }
            },
        ]
