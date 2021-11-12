import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, files, datasets, collections, authentication, items

API_V2_STR: str = "/api/v2"
PROJECT_NAME: str = "Clowder"

app = FastAPI(title=PROJECT_NAME, openapi_url=f"{API_V2_STR}/openapi.json")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(
    collections.router, prefix="/collections", tags=["collections"]
)
api_router.include_router(authentication.router, tags=["login"])
api_router.include_router(items.router, prefix="/items", tags=["items"])

app.include_router(api_router, prefix=API_V2_STR)


@app.on_event("startup")
async def startup_db_client():
    pass


@app.on_event("shutdown")
async def shutdown_db_client():
    pass


@app.get("/")
async def root():
    return {"message": "Hello World!"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
