"""HTTP API clients for Clowder v1 and Clowder v2."""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import httpx


class ApiError(RuntimeError):
    """Raised when a Clowder API response is not successful."""

    def __init__(self, message: str, status_code: Optional[int] = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class ClowderV1Client:
    """Minimal v1 API wrapper for inventory and blob export."""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        timeout: float = 120.0,
    ):
        self.base_url = base_url.rstrip("/")
        headers: Dict[str, str] = {}
        if api_key:
            headers["X-API-Key"] = api_key
        if username and password:
            token = base64.b64encode(f"{username}:{password}".encode()).decode()
            headers["Authorization"] = f"Basic {token}"
        self.client = httpx.Client(
            headers=headers, timeout=timeout, follow_redirects=True
        )

    def close(self) -> None:
        self.client.close()

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _v1_params(self, **params: Any) -> Dict[str, Any]:
        """Query params for v1 API calls; superAdmin bypasses permission filters."""
        return {"superAdmin": "true", **params}

    def get_json(self, path: str, **params: Any) -> Any:
        # Retry once on connection-level errors — the v1 HTTPS connection can go
        # idle during a long upload and be closed by the server.
        for attempt in range(2):
            try:
                response = self.client.get(
                    self._url(path), params=self._v1_params(**params)
                )
                break
            except (httpx.ReadError, httpx.RemoteProtocolError, httpx.ConnectError):
                if attempt == 0:
                    continue
                raise
        if response.status_code == 404:
            return None
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ApiError(str(exc), status_code=response.status_code) from exc
        return response.json()

    def list_datasets(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch v1 datasets, paging through cursor-based pagination.

        The v1 cursor uses `when=b` + `date=<created timestamp>` as a page
        token. If the server returns 500 on a paginated request (e.g. because
        it cannot parse the date format), we stop and return what we have so
        far rather than crashing the entire migration.
        """
        datasets: List[Dict[str, Any]] = []
        page_size = 1000 if limit is None else min(1000, max(limit, 1))
        params: Dict[str, Any] = {"limit": page_size}
        while True:
            try:
                page = self.get_json("/api/datasets", **params)
            except ApiError:
                # Pagination cursor caused a server error; return what we have
                break
            items: List[Dict[str, Any]] = []
            if isinstance(page, list):
                items = page
            elif isinstance(page, dict):
                items = page.get("data") or page.get("datasets") or []
            if not items:
                break
            datasets.extend(items)
            if limit is not None and len(datasets) >= limit:
                break
            if len(items) < params["limit"]:
                break
            # v1 uses `when=b` (before) + `date=<oldest created>` as cursor
            oldest = min(
                (ds.get("created") or ds.get("date") or "" for ds in items),
                default="",
            )
            if not oldest:
                break
            params = {"limit": 1000, "when": "b", "date": oldest}
        # Deduplicate by id in case cursor pages overlap
        seen: Dict[str, Dict[str, Any]] = {}
        for ds in datasets:
            ds_id = str(ds.get("id") or ds.get("_id") or "")
            if ds_id:
                seen[ds_id] = ds
        result = list(seen.values())
        if limit is not None:
            return result[:limit]
        return result

    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        return self.get_json(f"/api/datasets/{dataset_id}")

    def list_dataset_files(self, dataset_id: str) -> List[Dict[str, Any]]:
        # Use listAllFiles which is the confirmed v1 route (datasetAllFilesList)
        result = self.get_json(f"/api/datasets/{dataset_id}/listAllFiles", max=-1)
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("files") or result.get("data") or []
        return []

    def list_dataset_folders(self, dataset_id: str) -> List[Dict[str, Any]]:
        result = self.get_json(f"/api/datasets/{dataset_id}/folders")
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("folders") or result.get("data") or []
        return []

    def list_spaces(self) -> List[Dict[str, Any]]:
        spaces: List[Dict[str, Any]] = []
        params: Dict[str, Any] = {"limit": 1000}
        while True:
            try:
                page = self.get_json("/api/spaces", **params)
            except ApiError:
                break
            items: List[Dict[str, Any]] = []
            if isinstance(page, list):
                items = page
            elif isinstance(page, dict):
                items = page.get("data") or page.get("spaces") or []
            if not items:
                break
            spaces.extend(items)
            if len(items) < params["limit"]:
                break
            oldest = min(
                (s.get("created") or s.get("date") or "" for s in items), default=""
            )
            if not oldest:
                break
            params = {"limit": 1000, "when": "b", "date": oldest}
        seen: Dict[str, Dict[str, Any]] = {}
        for s in spaces:
            sid = str(s.get("id") or s.get("_id") or "")
            if sid:
                seen[sid] = s
        return list(seen.values())

    def list_users(self) -> List[Dict[str, Any]]:
        """List all v1 users (requires admin API key; returns [] if forbidden)."""
        try:
            result = self.get_json("/api/users")
        except ApiError:
            return []
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("data") or result.get("users") or []
        return []

    def list_space_users(self, space_id: str) -> List[Dict[str, Any]]:
        result = self.get_json(f"/api/spaces/{space_id}/users")
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("users") or result.get("data") or []
        return []

    def list_space_datasets(self, space_id: str) -> List[Dict[str, Any]]:
        result = self.get_json(f"/api/spaces/{space_id}/datasets", limit=0)
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("data") or result.get("datasets") or []
        return []

    def get_dataset_tags(self, dataset_id: str) -> List[str]:
        result = self.get_json(f"/api/datasets/{dataset_id}/tags")
        if isinstance(result, list):
            return [str(t) for t in result]
        if isinstance(result, dict):
            tags = result.get("tags") or result.get("data") or []
            return [str(t) for t in tags]
        return []

    def get_file_tags(self, file_id: str) -> List[str]:
        result = self.get_json(f"/api/files/{file_id}/tags")
        if isinstance(result, list):
            return [str(t) for t in result]
        if isinstance(result, dict):
            tags = result.get("tags") or result.get("data") or []
            return [str(t) for t in tags]
        return []

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.get_json(f"/api/users/email/{email}")

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.get_json(f"/api/users/{user_id}")

    def metadata_candidates(
        self, resource_type: str, resource_id: str
    ) -> Iterable[Any]:
        endpoints = [
            f"/api/{resource_type}/{resource_id}/metadata.jsonld",
            f"/api/{resource_type}/{resource_id}/usermetadatajson",
            f"/api/{resource_type}/{resource_id}/technicalmetadatajson",
            f"/api/{resource_type}/{resource_id}/xmlmetadatajson",
        ]
        for endpoint in endpoints:
            payload = self.get_json(endpoint)
            if payload:
                yield payload

    def get_extraction_metadata(self, resource_id: str) -> Optional[Any]:
        return self.get_json(f"/api/extractions/{resource_id}/metadata")

    def get_previews(self, file_id: str) -> List[Dict[str, Any]]:
        result = self.get_json(f"/api/files/{file_id}/getPreviews")
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            return result.get("previews") or result.get("data") or []
        return []

    def download_file_to(self, file_id: str, destination: Path) -> None:
        with self.client.stream(
            "GET",
            self._url(f"/api/files/{file_id}/blob"),
            params=self._v1_params(),
        ) as response:
            response.raise_for_status()
            with destination.open("wb") as output:
                for chunk in response.iter_bytes():
                    output.write(chunk)

    def download_thumbnail_to(self, thumbnail_id: str, destination: Path) -> bool:
        response = self.client.get(
            self._url(f"/api/thumbnails/{thumbnail_id}/blob"),
            params=self._v1_params(),
        )
        if response.status_code == 404:
            return False
        response.raise_for_status()
        destination.write_bytes(response.content)
        return True


class ClowderV2Client:
    """Minimal v2 API wrapper for imports."""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        bearer_token: Optional[str] = None,
        timeout: float = 120.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.Client(timeout=timeout, follow_redirects=True)
        self.api_key = api_key
        self.bearer_token = bearer_token

    def close(self) -> None:
        self.client.close()

    def as_user(self, token: str) -> "ClowderV2Client":
        return ClowderV2Client(self.base_url, bearer_token=token)

    def _headers(self) -> Dict[str, str]:
        if self.api_key:
            return {"X-API-KEY": self.api_key}
        if self.bearer_token:
            return {"Authorization": f"Bearer {self.bearer_token}"}
        return {}

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _json_from_response(self, response: httpx.Response) -> Any:
        content_type = (response.headers.get("content-type") or "").lower()
        if not response.content:
            raise ApiError(
                f"Empty response from {response.url}. "
                "Set CLOWDER2_BASE_URL to the backend API (e.g. http://localhost:8000/api/v2), "
                "not the frontend dev server."
            )
        if "json" not in content_type:
            snippet = response.text[:120].replace("\n", " ")
            raise ApiError(
                f"Expected JSON from {response.url} but got Content-Type {content_type!r}. "
                "CLOWDER2_BASE_URL must be the backend API base (…/api/v2 on port 8000 or "
                f"Traefik), not the React dev server. Body starts with: {snippet!r}"
            )
        try:
            return response.json()
        except json.JSONDecodeError as exc:
            raise ApiError(f"Invalid JSON from {response.url}: {exc}") from exc

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        headers = kwargs.pop("headers", {})
        headers.update(self._headers())
        try:
            response = self.client.request(
                method, self._url(path), headers=headers, **kwargs
            )
        except (httpx.WriteError, httpx.RemoteProtocolError, httpx.ConnectError) as exc:
            raise ApiError(f"Connection error during {method} {path}: {exc}") from exc
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ApiError(str(exc), status_code=response.status_code) from exc
        return response

    def login(self, email: str, password: str) -> str:
        response = self._request(
            "POST", "/login", json={"email": email, "password": password}
        )
        return self._json_from_response(response)["token"]

    def create_user(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
    ) -> Dict[str, Any]:
        body = {
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
        }
        return self._json_from_response(self._request("POST", "/users", json=body))

    def list_users(self, limit: int = 10_000) -> List[Dict[str, Any]]:
        try:
            response = self._request(
                "GET", "/users", params={"skip": 0, "limit": limit}
            )
        except ApiError:
            return []
        payload = self._json_from_response(response)
        return payload.get("data", []) if isinstance(payload, dict) else []

    def standard_license_id(self) -> Optional[str]:
        payload = self._json_from_response(
            self._request("GET", "/licenses/standard_licenses/all")
        )
        if isinstance(payload, list) and payload:
            return payload[0].get("id")
        return None

    def create_dataset(
        self, dataset: Dict[str, Any], license_id: str
    ) -> Dict[str, Any]:
        return self._json_from_response(
            self._request(
                "POST",
                "/datasets",
                params={"license_id": license_id},
                json=dataset,
            )
        )

    def create_folder(self, dataset_id: str, folder: Dict[str, Any]) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("POST", f"/datasets/{dataset_id}/folders", json=folder)
        )

    def upload_file(
        self,
        dataset_id: str,
        path: Path,
        filename: str,
        content_type: Optional[str],
        folder_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        params = {"folder_id": folder_id} if folder_id else None
        with path.open("rb") as file_obj:
            files = {
                "file": (filename, file_obj, content_type or "application/octet-stream")
            }
            return self._json_from_response(
                self._request(
                    "POST",
                    f"/datasets/{dataset_id}/files",
                    params=params,
                    files=files,
                )
            )

    def add_dataset_metadata(
        self, dataset_id: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("POST", f"/datasets/{dataset_id}/metadata", json=metadata)
        )

    def add_file_metadata(
        self, file_id: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("POST", f"/files/{file_id}/metadata", json=metadata)
        )

    def create_thumbnail(
        self, path: Path, content_type: str = "image/png"
    ) -> Dict[str, Any]:
        with path.open("rb") as file_obj:
            files = {"file": (path.name, file_obj, content_type)}
            return self._json_from_response(
                self._request("POST", "/thumbnails", files=files)
            )

    def attach_file_thumbnail(self, file_id: str, thumbnail_id: str) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("PATCH", f"/files/{file_id}/thumbnail/{thumbnail_id}")
        )

    def create_api_key(self, name: str) -> str:
        """Create a non-expiring API key for the authenticated user. Returns the raw key.

        mins=0 is required: the endpoint's default (settings.local_auth_expiration,
        30 minutes) is shorter than a full migration run, so keys created without it
        expire mid-run and every subsequent dataset for that owner fails with 401.
        """
        response = self._request(
            "POST", "/users/keys", params={"name": name, "mins": 0}
        )
        return self._json_from_response(response)

    def list_listeners(self) -> List[Dict[str, Any]]:
        payload = self._json_from_response(
            self._request(
                "GET", "/listeners", params={"skip": 0, "limit": 10_000, "all": True}
            )
        )
        if isinstance(payload, dict):
            return payload.get("data") or []
        return payload or []

    def create_listener(self, listener: Dict[str, Any]) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("POST", "/listeners", json=listener)
        )

    def create_group(self, name: str, description: str) -> Dict[str, Any]:
        return self._json_from_response(
            self._request(
                "POST", "/groups", json={"name": name, "description": description}
            )
        )

    def add_group_member(self, group_id: str, username: str) -> Dict[str, Any]:
        return self._json_from_response(
            self._request("POST", f"/groups/{group_id}/add/{username}")
        )

    def set_dataset_group_role(
        self, dataset_id: str, group_id: str, role: str
    ) -> Dict[str, Any]:
        return self._json_from_response(
            self._request(
                "POST",
                f"/authorizations/datasets/{dataset_id}/group_role/{group_id}/{role}",
            )
        )
