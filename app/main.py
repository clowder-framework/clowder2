import uvicorn
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    users,
    files,
    datasets,
    collections,
    authentication,
    folders,
)
from app.config import settings
from app.routers.authentication import auth_handler

app = FastAPI(
    title=settings.APP_NAME, openapi_url=f"{settings.API_V2_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(auth_handler.auth_wrapper)],
)
api_router.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
    dependencies=[Depends(auth_handler.auth_wrapper)],
)
api_router.include_router(
    datasets.router,
    prefix="/datasets",
    tags=["datasets"],
    dependencies=[Depends(auth_handler.auth_wrapper)],
)
api_router.include_router(
    collections.router,
    prefix="/collections",
    tags=["collections"],
    dependencies=[Depends(auth_handler.auth_wrapper)],
)
api_router.include_router(
    folders.router,
    prefix="/folders",
    tags=["folders"],
    dependencies=[Depends(auth_handler.auth_wrapper)],
)
api_router.include_router(authentication.router, tags=["login"])

app.include_router(api_router, prefix=settings.API_V2_STR)


@app.on_event("startup")
async def startup_db_client():
    pass


@app.on_event("shutdown")
async def shutdown_db_client():
    pass


@app.get("/")
async def root():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
