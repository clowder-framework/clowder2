from app.models.files import FileDB, FileFreezeDB
from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc


async def _increment_file_downloads(file_id: str):
    # Increment download count
    # if working draft
    if (
        file := await FileDB.find_one(FileDB.id == PydanticObjectId(file_id))
    ) is not None:
        await file.update(Inc({FileDB.downloads: 1}))

    # if published version
    if (
        file := await FileFreezeDB.find_one(
            FileFreezeDB.id == PydanticObjectId(file_id)
        )
    ) is not None:
        await file.update(Inc({FileFreezeDB.downloads: 1}))
