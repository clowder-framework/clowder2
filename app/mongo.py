async def crete_mongo_indexes(db):
    await db["files"].create_index("dataset_id")
    await db["files"].create_index("folder_id")
    await db["folders"].create_index("dataset_id")
    await db["folders"].create_index("folder_id")
