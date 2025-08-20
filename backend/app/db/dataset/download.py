from app.models.datasets import DatasetDB, DatasetFreezeDB
from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Inc


async def _increment_data_downloads(dataset_id: str):
    # if working draft
    if (
        dataset := await DatasetDB.find_one(
            DatasetDB.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        await dataset.update(Inc({DatasetDB.downloads: 1}))

    # if published version
    if (
        dataset := await DatasetFreezeDB.find_one(
            DatasetFreezeDB.id == PydanticObjectId(dataset_id)
        )
    ) is not None:
        await dataset.update(Inc({DatasetFreezeDB.downloads: 1}))
