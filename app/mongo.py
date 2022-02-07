async def crete_mongo_indexes(db):
    await db["files"].create_index("parent_dataset")
    await db["files"].create_index("parent_folder")
    await db["folders"].create_index("parent_dataset")
    await db["folders"].create_index("parent_folder")
