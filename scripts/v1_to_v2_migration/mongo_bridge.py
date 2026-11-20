"""Direct MongoDB/GridFS to MongoDB/MinIO migration path."""

from __future__ import annotations

import io
import json
import secrets
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional

import gridfs
from elasticsearch import Elasticsearch
from bson import ObjectId
from minio import Minio
from passlib.hash import bcrypt
from pymongo import MongoClient
from pymongo.database import Database

from .checkpoint import Checkpoint
from .config import MongoConfig
from .utils import (
    extract_email,
    first_present,
    harden_secret_file,
    normalize_status,
    parse_datetime,
    split_content_type,
    stringify_id,
    user_out,
    write_secret_json,
)


class MongoBridgeMigrator:
    """Migrates v1 Mongo/GridFS data directly into v2 MongoDB and MinIO."""

    def __init__(self, config: MongoConfig):
        self.config = config
        self.checkpoint = Checkpoint(config.checkpoint_path)
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        self.v1_client = MongoClient(config.v1_mongo_uri)
        self.v2_client = MongoClient(config.v2_mongo_uri)
        self.v1_db: Database = self.v1_client[config.v1_database]
        self.v2_db: Database = self.v2_client[config.v2_database]
        self.uploads_gridfs = gridfs.GridFS(self.v1_db, collection="uploads")
        self.thumbnails_gridfs = gridfs.GridFS(self.v1_db, collection="thumbnails")
        self.minio = Minio(
            config.minio_endpoint,
            access_key=config.minio_access_key,
            secret_key=config.minio_secret_key,
            secure=config.minio_secure,
        )

    def close(self) -> None:
        self.v1_client.close()
        self.v2_client.close()

    def dry_run_inventory(self) -> Dict[str, int]:
        collections = [
            "datasets",
            "folders",
            "uploads",
            "metadata",
            "metadata.definitions",
            "extractions",
            "comments",
            "social.users",
        ]
        counts = {
            name: self.v1_db[name].estimated_document_count() for name in collections
        }
        (self.config.output_dir / "mongo-inventory.json").write_text(
            json.dumps(counts, indent=2, sort_keys=True)
        )
        return counts

    def migrate(self, force: bool = False) -> None:
        self.dry_run_inventory()
        self._ensure_minio_bucket()
        self._ensure_default_license()
        self._migrate_users()
        for dataset in self.v1_db.datasets.find({}):
            v1_dataset_id = self._v1_uuid(dataset)
            if not v1_dataset_id:
                continue
            if self.checkpoint.contains("datasets", v1_dataset_id) and not force:
                continue
            self._migrate_dataset(dataset, v1_dataset_id)
        self._export_comments()
        self.reindex_elasticsearch()

    def _ensure_minio_bucket(self) -> None:
        if self.config.dry_run:
            return
        if not self.minio.bucket_exists(self.config.minio_bucket):
            self.minio.make_bucket(self.config.minio_bucket)

    def _ensure_default_license(self) -> Optional[str]:
        if self.config.default_license_id:
            return self.config.default_license_id
        existing = self.v2_db.licenses.find_one({})
        if existing:
            return str(existing["_id"])
        license_id = ObjectId()
        if not self.config.dry_run:
            now = datetime.utcnow()
            self.v2_db.licenses.insert_one(
                {
                    "_id": license_id,
                    "name": "Migrated legacy license",
                    "description": "Placeholder license for v1 migration.",
                    "holders": [],
                    "creator": self.config.default_owner_email,
                    "created": now,
                    "modified": now,
                }
            )
        return str(license_id)

    def _migrate_users(self) -> None:
        users = self._owner_docs()
        # Each inserted user gets its own random password. They are recorded in
        # the same (git-ignored) file the API migrator uses, so an operator can
        # hand them out or force a reset; no shared, guessable default exists.
        passwords_path = self.config.output_dir / "generated-owner-passwords.json"
        passwords: Dict[str, str] = {}
        if passwords_path.exists():
            harden_secret_file(passwords_path)
            passwords.update(json.loads(passwords_path.read_text()))
        generated = False
        try:
            for email, user in users.items():
                if self.checkpoint.contains("users", email):
                    continue
                if self.config.dry_run:
                    self.checkpoint.set("users", email, user)
                    continue
                existing = self.v2_db.users.find_one({"email": email})
                if existing:
                    self.checkpoint.set("users", email, str(existing["_id"]))
                    continue
                # Random per-user password; operators must rotate these (or
                # provision Keycloak accounts) before handing access to users.
                # Login is Keycloak-backed, so these hashes are a local-auth
                # fallback only — never a shared default like "change-me".
                password = secrets.token_urlsafe(18)
                user_doc = {
                    **user,
                    "hashed_password": bcrypt.hash(password),
                    "keycloak_id": None,
                }
                inserted = self.v2_db.users.insert_one(user_doc)
                passwords[email] = password
                generated = True
                self.checkpoint.set("users", email, str(inserted.inserted_id))
        finally:
            if generated:
                write_secret_json(passwords_path, passwords)

    def _owner_docs(self) -> Dict[str, Dict[str, Any]]:
        owners: Dict[str, Dict[str, Any]] = {}
        for dataset in self.v1_db.datasets.find({}, {"author": 1}):
            author = dataset.get("author") or {}
            email = extract_email(author, self.config.default_owner_email)
            owners[email] = user_out(
                email,
                first_name=str(
                    first_present(author, ("firstName", "first_name")) or ""
                ),
                last_name=str(first_present(author, ("lastName", "last_name")) or ""),
            )
        if self.config.default_owner_email not in owners:
            owners[self.config.default_owner_email] = user_out(
                self.config.default_owner_email
            )
        return owners

    def _migrate_dataset(self, dataset: Dict[str, Any], v1_dataset_id: str) -> None:
        dataset_id = ObjectId()
        author = dataset.get("author") or {}
        owner_email = extract_email(author, self.config.default_owner_email)
        creator = self._creator(owner_email, author)
        now = datetime.utcnow()
        created = parse_datetime(first_present(dataset, ("created", "createdDate")))
        modified = parse_datetime(
            first_present(dataset, ("modified", "updated", "modifiedDate"))
        )
        license_id = self._ensure_default_license()
        dataset_doc = {
            "_id": dataset_id,
            "name": first_present(dataset, ("name", "title"))
            or f"Dataset {v1_dataset_id}",
            "description": dataset.get("description"),
            "creator": creator,
            "created": created or now,
            "modified": modified or now,
            "status": normalize_status(dataset),
            "user_views": 0,
            "downloads": int(dataset.get("downloads") or 0),
            "thumbnail_id": None,
            "standard_license": True,
            "license_id": license_id,
            "frozen": False,
            "frozen_version_num": -999,
        }
        if not self.config.dry_run:
            self.v2_db.datasets.insert_one(dataset_doc)
            self.v2_db.authorization.insert_one(
                {
                    "_id": ObjectId(),
                    "dataset_id": dataset_id,
                    "user_ids": [owner_email],
                    "role": "owner",
                    "group_ids": [],
                    "creator": owner_email,
                    "created": now,
                    "modified": now,
                }
            )
        self.checkpoint.set("datasets", v1_dataset_id, str(dataset_id))
        self._migrate_folders(v1_dataset_id, dataset_id, creator)
        self._migrate_files(v1_dataset_id, dataset_id, creator, dataset_doc["status"])
        self._migrate_metadata("datasets", v1_dataset_id, dataset_id, creator)

    def _migrate_folders(
        self,
        v1_dataset_id: str,
        v2_dataset_id: ObjectId,
        creator: Dict[str, Any],
    ) -> None:
        query = {"parentDatasetId": self._uuid_query_value(v1_dataset_id)}
        folders = list(self.v1_db.folders.find(query))
        remaining = folders or list(
            self.v1_db.folders.find({"parentDatasetId": v1_dataset_id})
        )
        while remaining:
            progressed = False
            for folder in list(remaining):
                v1_folder_id = self._v1_uuid(folder)
                if not v1_folder_id:
                    remaining.remove(folder)
                    continue
                parent_v1_id = stringify_id(
                    first_present(
                        folder, ("parentFolderId", "parent_folder", "parentId")
                    )
                )
                if parent_v1_id and not self.checkpoint.get("folders", parent_v1_id):
                    continue
                folder_id = ObjectId()
                parent_id = (
                    ObjectId(self.checkpoint.get("folders", parent_v1_id))
                    if parent_v1_id
                    else None
                )
                if not self.config.dry_run:
                    self.v2_db.folders.insert_one(
                        {
                            "_id": folder_id,
                            "name": first_present(folder, ("name", "foldername"))
                            or "Folder",
                            "dataset_id": v2_dataset_id,
                            "parent_folder": parent_id,
                            "creator": creator,
                            "created": parse_datetime(folder.get("created")),
                            "modified": parse_datetime(folder.get("modified")),
                            "object_type": "folder",
                            "origin_id": None,
                        }
                    )
                self.checkpoint.set("folders", v1_folder_id, str(folder_id))
                remaining.remove(folder)
                progressed = True
            if not progressed:
                raise RuntimeError(
                    f"Could not resolve folder parents for {v1_dataset_id}"
                )

    def _migrate_files(
        self,
        v1_dataset_id: str,
        v2_dataset_id: ObjectId,
        creator: Dict[str, Any],
        status: str,
    ) -> None:
        file_ids = [
            stringify_id(value) for value in self._dataset_file_ids(v1_dataset_id)
        ]
        files = self._files_for_dataset(v1_dataset_id, file_ids)
        for file_doc in files:
            v1_file_id = self._v1_uuid(file_doc)
            if not v1_file_id or self.checkpoint.contains("files", v1_file_id):
                continue
            file_id = ObjectId()
            filename = (
                first_present(file_doc, ("filename", "name", "originalname"))
                or v1_file_id
            )
            content_type = first_present(file_doc, ("contentType", "content_type"))
            v2_folder = self._mapped_folder_for_file(file_doc)
            version_id, byte_count = self._stream_file_to_minio(file_doc, file_id)
            file_doc_v2 = {
                "_id": file_id,
                "name": filename,
                "status": status,
                "creator": creator,
                "created": parse_datetime(
                    first_present(file_doc, ("uploadDate", "created"))
                ),
                "version_id": str(version_id),
                "version_num": 1,
                "dataset_id": v2_dataset_id,
                "folder_id": v2_folder,
                "views": 0,
                "downloads": 0,
                "bytes": byte_count,
                "content_type": split_content_type(content_type),
                "thumbnail_id": None,
                "storage_type": "minio",
                "storage_path": None,
                "object_type": "file",
                "origin_id": None,
            }
            if not self.config.dry_run:
                self.v2_db.files.insert_one(file_doc_v2)
                self.v2_db.file_versions.insert_one(
                    {
                        "_id": ObjectId(),
                        "file_id": file_id,
                        "creator": creator,
                        "created": file_doc_v2["created"],
                        "version_id": str(version_id),
                        "version_num": 1,
                        "bytes": byte_count,
                    }
                )
            self.checkpoint.set("files", v1_file_id, str(file_id))
            self._migrate_metadata("files", v1_file_id, file_id, creator)
            self._migrate_thumbnail(file_doc, file_id, creator)

    def _dataset_file_ids(self, v1_dataset_id: str) -> Iterable[Any]:
        dataset = self.v1_db.datasets.find_one(
            {"id": self._uuid_query_value(v1_dataset_id)}
        )
        if not dataset:
            dataset = self.v1_db.datasets.find_one({"id": v1_dataset_id})
        return dataset.get("files", []) if dataset else []

    def _files_for_dataset(
        self,
        v1_dataset_id: str,
        file_ids: List[Optional[str]],
    ) -> List[Dict[str, Any]]:
        if file_ids:
            candidates = [{"id": {"$in": file_ids}}, {"_id": {"$in": file_ids}}]
            for query in candidates:
                docs = list(self.v1_db.uploads.find(query))
                if docs:
                    return docs
        return list(self.v1_db.uploads.find({"datasetId": v1_dataset_id}))

    def _mapped_folder_for_file(self, file_doc: Dict[str, Any]) -> Optional[ObjectId]:
        v1_folder_id = stringify_id(first_present(file_doc, ("folderId", "folder_id")))
        mapped = self.checkpoint.get("folders", v1_folder_id) if v1_folder_id else None
        return ObjectId(mapped) if mapped else None

    def _stream_file_to_minio(
        self, file_doc: Dict[str, Any], v2_file_id: ObjectId
    ) -> tuple[str, int]:
        stream = self._gridfs_stream(self.uploads_gridfs, file_doc)
        data = stream.read()
        byte_count = len(data)
        if self.config.dry_run:
            return "dry-run", byte_count
        content_type = first_present(file_doc, ("contentType", "content_type"))
        result = self.minio.put_object(
            self.config.minio_bucket,
            str(v2_file_id),
            io.BytesIO(data),
            length=byte_count,
            content_type=content_type or "application/octet-stream",
        )
        return result.version_id or "N/A", byte_count

    def _migrate_thumbnail(
        self,
        file_doc: Dict[str, Any],
        v2_file_id: ObjectId,
        creator: Dict[str, Any],
    ) -> None:
        v1_thumbnail_id = stringify_id(
            first_present(file_doc, ("thumbnail_id", "thumbnailId"))
        )
        if not v1_thumbnail_id or self.checkpoint.contains(
            "thumbnails", v1_thumbnail_id
        ):
            return
        thumbnail_id = ObjectId()
        try:
            stream = self._gridfs_stream(
                self.thumbnails_gridfs, {"id": v1_thumbnail_id}
            )
        except FileNotFoundError:
            return
        data = stream.read()
        if not self.config.dry_run:
            self.minio.put_object(
                self.config.minio_bucket,
                str(thumbnail_id),
                io.BytesIO(data),
                length=len(data),
                content_type="image/png",
            )
            self.v2_db.thumbnails.insert_one(
                {
                    "_id": thumbnail_id,
                    "creator": creator,
                    "created": datetime.utcnow(),
                    "modified": datetime.utcnow(),
                    "bytes": len(data),
                    "content_type": split_content_type("image/png"),
                    "downloads": 0,
                    "origin_id": None,
                }
            )
            self.v2_db.files.update_one(
                {"_id": v2_file_id},
                {"$set": {"thumbnail_id": thumbnail_id}},
            )
        self.checkpoint.set("thumbnails", v1_thumbnail_id, str(thumbnail_id))

    def _migrate_metadata(
        self,
        resource_collection: str,
        v1_resource_id: str,
        v2_resource_id: ObjectId,
        creator: Dict[str, Any],
    ) -> None:
        queries = [
            {"attachedTo._id": self._uuid_query_value(v1_resource_id)},
            {"resource_id": v1_resource_id},
            {"file_id": v1_resource_id},
            {"dataset_id": v1_resource_id},
        ]
        for metadata_doc in self._find_any("metadata", queries):
            metadata_id = ObjectId()
            content = (
                first_present(metadata_doc, ("content", "json", "metadata"))
                or metadata_doc
            )
            if not self.config.dry_run:
                self.v2_db.metadata.insert_one(
                    {
                        "_id": metadata_id,
                        "context": metadata_doc.get("context"),
                        "context_url": metadata_doc.get("context_url"),
                        "definition": metadata_doc.get("definition"),
                        "content": content,
                        "description": metadata_doc.get("description")
                        or "Migrated legacy metadata",
                        "resource": {
                            "collection": resource_collection,
                            "resource_id": v2_resource_id,
                        },
                        "agent": {"creator": creator, "listener": None},
                        "created": parse_datetime(metadata_doc.get("created")),
                        "origin_id": None,
                    }
                )

    def _export_comments(self) -> None:
        comments_dir = self.config.output_dir / "comments"
        comments_dir.mkdir(parents=True, exist_ok=True)
        for comment in self.v1_db.comments.find({}):
            target_id = stringify_id(
                first_present(
                    comment, ("dataset_id", "file_id", "comment_id", "resource_id")
                )
            )
            if not target_id:
                target_id = stringify_id(comment.get("_id")) or "unknown"
            path = comments_dir / f"{target_id}.jsonl"
            with path.open("a") as output:
                output.write(json.dumps(comment, default=str) + "\n")

    def reindex_elasticsearch(self) -> None:
        """Best-effort search backfill for direct Mongo writes."""

        if self.config.dry_run or not self.config.elasticsearch_url:
            return
        es = Elasticsearch(self.config.elasticsearch_url)
        auth_by_dataset = {
            auth["dataset_id"]: auth.get("user_ids", [])
            for auth in self.v2_db.authorization.find({})
        }
        for dataset in self.v2_db.datasets.find({"frozen": {"$ne": True}}):
            metadata = self._metadata_for("datasets", dataset["_id"])
            es.index(
                index=self.config.elasticsearch_index,
                id=str(dataset["_id"]),
                document={
                    "resource_type": "dataset",
                    "name": dataset.get("name"),
                    "description": dataset.get("description"),
                    "creator": dataset.get("creator", {}).get("email"),
                    "created": dataset.get("created"),
                    "modified": dataset.get("modified"),
                    "downloads": dataset.get("downloads", 0),
                    "user_ids": auth_by_dataset.get(dataset["_id"], []),
                    "metadata": metadata,
                    "status": dataset.get("status"),
                },
            )
        for file_doc in self.v2_db.files.find({}):
            metadata = self._metadata_for("files", file_doc["_id"])
            es.index(
                index=self.config.elasticsearch_index,
                id=str(file_doc["_id"]),
                document={
                    "resource_type": "file",
                    "name": file_doc.get("name"),
                    "creator": file_doc.get("creator", {}).get("email"),
                    "created": file_doc.get("created"),
                    "downloads": file_doc.get("downloads", 0),
                    "user_ids": auth_by_dataset.get(file_doc.get("dataset_id"), []),
                    "content_type": file_doc.get("content_type", {}).get(
                        "content_type"
                    ),
                    "content_type_main": file_doc.get("content_type", {}).get(
                        "main_type"
                    ),
                    "dataset_id": str(file_doc.get("dataset_id")),
                    "folder_id": str(file_doc.get("folder_id")),
                    "bytes": file_doc.get("bytes", 0),
                    "metadata": metadata,
                    "status": file_doc.get("status"),
                },
            )

    def _metadata_for(
        self, collection: str, resource_id: ObjectId
    ) -> List[Dict[str, Any]]:
        return [
            metadata.get("content", {})
            for metadata in self.v2_db.metadata.find(
                {"resource.collection": collection, "resource.resource_id": resource_id}
            )
        ]

    def _find_any(
        self, collection: str, queries: Iterable[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        for query in queries:
            docs = list(self.v1_db[collection].find(query))
            if docs:
                return docs
        return []

    def _gridfs_stream(self, bucket: gridfs.GridFS, doc: Dict[str, Any]):
        candidates = [
            doc.get("_id"),
            doc.get("id"),
            doc.get("loader_id"),
            stringify_id(doc.get("_id")),
            stringify_id(doc.get("id")),
        ]
        for candidate in [value for value in candidates if value]:
            try:
                return bucket.get(candidate)
            except Exception:
                try:
                    if ObjectId.is_valid(str(candidate)):
                        return bucket.get(ObjectId(str(candidate)))
                except Exception:
                    pass
        raise FileNotFoundError(
            f"Could not find GridFS payload for {self._v1_uuid(doc)}"
        )

    def _creator(self, email: str, author: Dict[str, Any]) -> Dict[str, Any]:
        return user_out(
            email,
            first_name=str(first_present(author, ("firstName", "first_name")) or ""),
            last_name=str(first_present(author, ("lastName", "last_name")) or ""),
        )

    def _v1_uuid(self, document: Dict[str, Any]) -> Optional[str]:
        return stringify_id(first_present(document, ("id", "_id")))

    def _uuid_query_value(self, value: str) -> Any:
        return value
