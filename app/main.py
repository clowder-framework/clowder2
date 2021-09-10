import os

import motor
import uvicorn
from fastapi import Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

from app.dependencies import get_query_token, get_token_header
from app.routers import items, users, datasets

app = FastAPI(dependencies=[Depends(get_query_token)])

app.include_router(users.router)
app.include_router(items.router)
app.include_router(datasets.router)


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


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
