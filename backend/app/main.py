import logging

import uvicorn
from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.authorization import AuthorizationDB
from app.models.config import ConfigEntryDB
from app.models.datasets import DatasetDB, DatasetDBViewList, DatasetFreezeDB
from app.models.errors import ErrorDB
from app.models.feeds import FeedDB
from app.models.files import FileDB, FileDBViewList, FileFreezeDB, FileVersionDB
from app.models.folder_and_file import FolderFileViewList
from app.models.folders import FolderDB, FolderDBViewList, FolderFreezeDB
from app.models.groups import GroupDB
from app.models.licenses import LicenseDB
from app.models.listeners import (
    EventListenerDB,
    EventListenerJobDB,
    EventListenerJobUpdateDB,
    EventListenerJobUpdateViewList,
    EventListenerJobViewList,
)
from app.models.metadata import (
    MetadataDB,
    MetadataDBViewList,
    MetadataDefinitionDB,
    MetadataFreezeDB,
)
from app.models.thumbnails import ThumbnailDB, ThumbnailDBViewList, ThumbnailFreezeDB
from app.models.tokens import TokenDB
from app.models.users import ListenerAPIKeyDB, UserAPIKeyDB, UserDB
from app.models.visualization_config import (
    VisualizationConfigDB,
    VisualizationConfigDBViewList,
    VisualizationConfigFreezeDB,
)
from app.models.visualization_data import (
    VisualizationDataDB,
    VisualizationDataDBViewList,
    VisualizationDataFreezeDB,
)
from app.models.project import ProjectDB
from app.routers import (
    authentication,
    authorization,
    datasets,
    elasticsearch,
    feeds,
    files,
    folders,
    groups,
    jobs,
    keycloak,
    licenses,
    listeners,
    metadata,
    metadata_datasets,
    metadata_files,
    public_datasets,
    public_elasticsearch,
    public_files,
    public_folders,
    public_metadata,
    public_thumbnails,
    public_visualization,
    status,
    thumbnails,
    users,
    visualization,
    projects,
)

# setup loggers
# logging.config.fileConfig('logging.conf', disable_existing_loggers=False)
from app.search.config import indexSettings
from app.search.connect import connect_elasticsearch, create_index
from beanie import init_beanie
from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseConfig

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V2_STR}/openapi.json",
    description="A cloud native data management framework to support any research domain. Clowder was "
    "developed to help researchers and scientists in data intensive domains manage raw data, complex "
    "metadata, and automatic data pipelines. ",
    version="2.0.0-beta.2",
    contact={"name": "Clowder", "url": "https://clowderframework.org/"},
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
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
    public_metadata.router,
    prefix="/public_metadata",
    tags=["public_metadata"],
)
api_router.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    public_files.router,
    prefix="/public_files",
    tags=["public_files"],
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
    public_datasets.router,
    prefix="/public_datasets",
    tags=["public_datasets"],
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
    public_folders.router,
    prefix="/public_folders",
    tags=["public_folders"],
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
    public_elasticsearch.router,
    prefix="/public_elasticsearch",
    tags=["public_elasticsearch"],
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
api_router.include_router(
    visualization.router,
    prefix="/visualizations",
    tags=["visualizations"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    public_visualization.router,
    prefix="/public_visualizations",
    tags=["public_visualizations"],
)
api_router.include_router(
    thumbnails.router,
    prefix="/thumbnails",
    tags=["thumbnails"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    public_thumbnails.router,
    prefix="/public_thumbnails",
    tags=["public_thumbnails"],
)
api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["projects"],
)
api_router.include_router(
    licenses.router,
    prefix="/licenses",
    tags=["licenses"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    licenses.public_router, prefix="/public_licenses", tags=["public_licenses"]
)
api_router.include_router(status.router, prefix="/status", tags=["status"])
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
        document_models=[
            ConfigEntryDB,
            DatasetDB,
            DatasetFreezeDB,
            DatasetDBViewList,
            AuthorizationDB,
            MetadataDB,
            MetadataFreezeDB,
            MetadataDBViewList,
            MetadataDefinitionDB,
            FolderDB,
            FolderFreezeDB,
            FolderDBViewList,
            FileDB,
            FileFreezeDB,
            FileVersionDB,
            FileDBViewList,
            FolderFileViewList,
            FeedDB,
            EventListenerDB,
            EventListenerJobDB,
            EventListenerJobUpdateDB,
            EventListenerJobViewList,
            EventListenerJobUpdateViewList,
            UserDB,
            UserAPIKeyDB,
            ListenerAPIKeyDB,
            GroupDB,
            TokenDB,
            ErrorDB,
            VisualizationConfigDB,
            VisualizationConfigFreezeDB,
            VisualizationConfigDBViewList,
            VisualizationDataDB,
            VisualizationDataFreezeDB,
            VisualizationDataDBViewList,
            ThumbnailDB,
            ThumbnailFreezeDB,
            ThumbnailDBViewList,
            LicenseDB,
            ProjectDB,
        ],
        recreate_views=True,
    )


@app.on_event("startup")
async def startup_elasticsearch():
    # create elasticsearch indices
    es = await connect_elasticsearch()
    create_index(
        es,
        settings.elasticsearch_index,
        settings.elasticsearch_setting,
        indexSettings.es_mappings,
    )


@app.on_event("shutdown")
async def shutdown_db_client():
    pass


@app.get("/")
async def root():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
