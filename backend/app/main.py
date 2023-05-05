import logging

import uvicorn
from beanie import init_beanie
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseConfig

from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.authorization import AuthorizationDB
from app.models.datasets import DatasetDB, DatasetDBViewList
from app.models.feeds import FeedDB
from app.routers import (
    folders,
    groups,
)
from app.routers import (
    users,
    authorization,
    metadata,
    files,
    metadata_files,
    datasets,
    metadata_datasets,
    authentication,
    keycloak,
    elasticsearch,
    listeners,
    feeds,
    jobs,
)

# setup loggers
# logging.config.fileConfig('logging.conf', disable_existing_loggers=False)
from app.search.config import indexSettings
from app.search.connect import connect_elasticsearch, create_index

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME, openapi_url=f"{settings.API_V2_STR}/openapi.json"
)
BaseConfig.arbitrary_types_allowed = True

# @app.middleware("http")
# async def log_requests(request: Request, call_next):
#     idem = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
#     logger.info(f"rid={idem} start request path={request.url.path}")
#     start_time = time.time()
#
#     response = await call_next(request)
#
#     process_time = (time.time() - start_time) * 1000
#     formatted_process_time = '{0:.2f}'.format(process_time)
#     logger.info(f"rid={idem} completed_in={formatted_process_time}ms status_code={response.status_code}")
#
#     return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(authentication.router, tags=["login"])
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    authorization.router,
    prefix="/authorizations",
    tags=["authorization"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata.router,
    prefix="/metadata",
    tags=["metadata"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata_files.router,
    prefix="/files",
    tags=["metadata"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    datasets.router,
    prefix="/datasets",
    tags=["datasets"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata_datasets.router,
    prefix="/datasets",
    tags=["metadata"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    folders.router,
    prefix="/folders",
    tags=["folders"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    listeners.router,
    prefix="/listeners",
    tags=["listeners"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    listeners.legacy_router,
    prefix="/extractors",
    tags=["extractors"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    jobs.router,
    prefix="/jobs",
    tags=["jobs"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    elasticsearch.router,
    prefix="/elasticsearch",
    tags=["elasticsearch"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    feeds.router,
    prefix="/feeds",
    tags=["feeds"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    groups.router,
    prefix="/groups",
    tags=["groups"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(keycloak.router, prefix="/auth", tags=["auth"])
app.include_router(api_router, prefix=settings.API_V2_STR)


def gather_documents():
    pass


@app.on_event("startup")
async def startup_beanie():
    """Setup Beanie Object Document Mapper (ODM) to interact with MongoDB."""
    client = AsyncIOMotorClient(str(settings.MONGODB_URL))
    await init_beanie(
        database=getattr(client, settings.MONGO_DATABASE),
        # Make sure to include all models. If one depends on another that is not in the list it is not clear which one is missing.
        # TODO: autogenerate this list if possible
        document_models=[DatasetDB, DatasetDBViewList, AuthorizationDB, FeedDB],
        recreate_views=True,
    )


@app.on_event("startup")
async def startup_elasticsearch():
    # create elasticsearch indices
    es = await connect_elasticsearch()
    create_index(
        es, "file", settings.elasticsearch_setting, indexSettings.file_mappings
    )
    create_index(
        es, "dataset", settings.elasticsearch_setting, indexSettings.dataset_mappings
    )
    create_index(
        es, "metadata", settings.elasticsearch_setting, indexSettings.metadata_mappings
    )


@app.on_event("shutdown")
async def shutdown_db_client():
    pass


@app.get("/")
async def root():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
