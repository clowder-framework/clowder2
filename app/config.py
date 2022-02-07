from typing import List

from pydantic import BaseSettings, AnyHttpUrl


class Settings(BaseSettings):
    APP_NAME: str = "Clowder"
    API_V2_STR: str = "/api/v2"
    admin_email: str = "devnull@ncsa.illinois.edu"

    # exposing default ports for fronted
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGO_DATABASE: str = "clowder2"

    MINIO_SERVER_URL: str = "localhost:9000"
    MINIO_BUCKET_NAME: str = "clowder"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_UPLOAD_CHUNK_SIZE: int = 10 * 1024 * 1024


settings = Settings()
