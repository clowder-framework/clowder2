"""Configuration for Clowder v1 to v2 migration commands."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class ApiConfig:
    """HTTP API configuration for the API-first migration path."""

    clowder1_url: str
    clowder2_url: str
    checkpoint_path: Path
    output_dir: Path
    clowder1_api_key: Optional[str] = None
    clowder1_username: Optional[str] = None
    clowder1_password: Optional[str] = None
    clowder2_admin_email: Optional[str] = None
    clowder2_admin_password: Optional[str] = None
    clowder2_api_key: Optional[str] = None
    owner_passwords_path: Optional[Path] = None
    license_id: Optional[str] = None
    dry_run: bool = False
    timeout_seconds: float = 120.0

    @classmethod
    def from_env(cls, *, require_v2: bool = True) -> "ApiConfig":
        if require_v2:
            clowder2_url = os.environ["CLOWDER2_BASE_URL"].rstrip("/")
        else:
            # Inventory only talks to v1. An empty v2 URL is valid there.
            clowder2_url = os.getenv("CLOWDER2_BASE_URL", "").rstrip("/")
        if ":3000" in clowder2_url:
            raise ValueError(
                "CLOWDER2_BASE_URL appears to target the frontend dev server (port 3000). "
                "Use the backend API instead, e.g. http://localhost:8000/api/v2"
            )
        return cls(
            clowder1_url=os.environ["CLOWDER1_BASE_URL"].rstrip("/"),
            clowder2_url=clowder2_url,
            checkpoint_path=Path(
                os.getenv("MIGRATION_CHECKPOINT", "migration-checkpoint.json")
            ),
            output_dir=Path(os.getenv("MIGRATION_OUTPUT_DIR", "migration-output")),
            clowder1_api_key=os.getenv("CLOWDER1_API_KEY"),
            clowder1_username=os.getenv("CLOWDER1_USERNAME"),
            clowder1_password=os.getenv("CLOWDER1_PASSWORD"),
            clowder2_admin_email=os.getenv("CLOWDER2_ADMIN_EMAIL"),
            clowder2_admin_password=os.getenv("CLOWDER2_ADMIN_PASSWORD"),
            clowder2_api_key=os.getenv("CLOWDER2_API_KEY"),
            owner_passwords_path=(
                Path(os.environ["CLOWDER2_OWNER_PASSWORDS"])
                if os.getenv("CLOWDER2_OWNER_PASSWORDS")
                else None
            ),
            license_id=os.getenv("CLOWDER2_LICENSE_ID"),
            dry_run=_env_bool("MIGRATION_DRY_RUN"),
            timeout_seconds=float(os.getenv("MIGRATION_TIMEOUT_SECONDS", "120")),
        )


@dataclass(frozen=True)
class MongoConfig:
    """Direct MongoDB/GridFS/MinIO configuration for the Mongo-first path."""

    v1_mongo_uri: str
    v1_database: str
    v2_mongo_uri: str
    v2_database: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str
    checkpoint_path: Path
    output_dir: Path
    minio_secure: bool = False
    dry_run: bool = False
    default_owner_email: str = "migration@localhost.localdomain"
    default_license_id: Optional[str] = None
    elasticsearch_url: Optional[str] = None
    elasticsearch_index: str = "clowder"

    @classmethod
    def from_env(cls) -> "MongoConfig":
        return cls(
            v1_mongo_uri=os.environ["CLOWDER1_MONGODB_URL"],
            v1_database=os.getenv("CLOWDER1_MONGO_DATABASE", "clowder"),
            v2_mongo_uri=os.environ["CLOWDER2_MONGODB_URL"],
            v2_database=os.getenv("CLOWDER2_MONGO_DATABASE", "clowder2"),
            minio_endpoint=os.environ["CLOWDER2_MINIO_SERVER_URL"],
            minio_access_key=os.environ["CLOWDER2_MINIO_ACCESS_KEY"],
            minio_secret_key=os.environ["CLOWDER2_MINIO_SECRET_KEY"],
            minio_bucket=os.getenv("CLOWDER2_MINIO_BUCKET_NAME", "clowder"),
            minio_secure=_env_bool("CLOWDER2_MINIO_SECURE"),
            checkpoint_path=Path(
                os.getenv("MIGRATION_CHECKPOINT", "migration-checkpoint.json")
            ),
            output_dir=Path(os.getenv("MIGRATION_OUTPUT_DIR", "migration-output")),
            dry_run=_env_bool("MIGRATION_DRY_RUN"),
            default_owner_email=os.getenv(
                "MIGRATION_DEFAULT_OWNER_EMAIL", "migration@localhost.localdomain"
            ),
            default_license_id=os.getenv("CLOWDER2_LICENSE_ID"),
            elasticsearch_url=os.getenv("CLOWDER2_ELASTICSEARCH_URL"),
            elasticsearch_index=os.getenv("CLOWDER2_ELASTICSEARCH_INDEX", "clowder"),
        )
