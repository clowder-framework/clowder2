import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, files, datasets, collections, authentication, items

# app = FastAPI(dependencies=[Depends(get_query_token)])


app = FastAPI()

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


app.include_router(users.router)
app.include_router(files.router)
app.include_router(datasets.router)
app.include_router(collections.router)
app.include_router(authentication.router)
app.include_router(items.router)


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
