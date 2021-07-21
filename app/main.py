import os

import motor
from fastapi import Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

from .dependencies import get_query_token, get_token_header
from .routers import items, users

app = FastAPI(dependencies=[Depends(get_query_token)])

app.include_router(users.router)
app.include_router(items.router)


@app.on_event("startup")
async def startup_db_client():
    # app.mongodb_client = AsyncIOMotorClient(settings.DB_URL)
    # app.mongodb = app.mongodb_client[settings.DB_NAME]
    app.mongo_client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
    app.db = app.mongo_client.clowder


@app.on_event("shutdown")
async def shutdown_db_client():
    # app.mongodb_client.close()
    pass


@app.get("/")
async def root():
    return {"message": "Hello World!"}
