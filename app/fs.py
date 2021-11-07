import os
from minio import Minio
from minio.error import S3Error

FileStorage = Minio(
    os.getenv("MINIO_SERVER_URL", "localhost:9001"),
    access_key=os.getenv("MINIO_ACCESS_KEY", "clowder"),
    secret_key=os.getenv("MINIO_SECRET_KEY", "clowdersecret"),
)
