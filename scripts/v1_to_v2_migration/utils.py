"""Shared normalization helpers for Clowder migration scripts."""

from __future__ import annotations

import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

from bson import ObjectId

_SECRET_FILE_MODE = 0o600
_ERROR_MESSAGE_MAX_LEN = 200


UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def harden_secret_file(path: Path) -> None:
    """Best-effort chmod 0600 for an existing credential file."""
    try:
        if path.exists():
            os.chmod(path, _SECRET_FILE_MODE)
    except OSError:
        pass


def write_secret_json(path: Path, payload: Any) -> None:
    """Write JSON with mode 0600 so credential files are not group/world readable."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(str(path), os.O_WRONLY | os.O_CREAT | os.O_TRUNC, _SECRET_FILE_MODE)
    with os.fdopen(fd, "w") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")
    harden_secret_file(path)


def sanitize_error(exc: BaseException, max_len: int = _ERROR_MESSAGE_MAX_LEN) -> str:
    """Collapse and truncate exception text so failure logs do not store HTTP bodies."""
    text = " ".join(f"{type(exc).__name__}: {exc}".split())
    if len(text) > max_len:
        return text[: max_len - 3] + "..."
    return text


def secure_temp_file(suffix: str = "") -> Path:
    """Create a 0600 temp file and return its path. Caller must unlink it."""
    fd, name = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    os.chmod(name, _SECRET_FILE_MODE)
    return Path(name)


def first_present(document: Dict[str, Any], names: Iterable[str]) -> Any:
    """Return the first non-empty value found in a document."""

    for name in names:
        value = document.get(name)
        if value not in (None, "", [], {}):
            return value
    return None


def stringify_id(value: Any) -> Optional[str]:
    """Convert UUID/ObjectId-ish values from either Clowder generation to strings."""

    if value is None:
        return None
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        for key in ("$uuid", "$oid", "id", "_id"):
            if key in value:
                return stringify_id(value[key])
    return str(value)


def parse_datetime(value: Any) -> datetime:
    """Best-effort datetime conversion for Mongo and JSON API values."""

    if isinstance(value, datetime):
        return value
    if isinstance(value, dict) and "$date" in value:
        return parse_datetime(value["$date"])
    if isinstance(value, (int, float)):
        if value > 10_000_000_000:
            value = value / 1000
        return datetime.fromtimestamp(value, tz=timezone.utc).replace(tzinfo=None)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(
                tzinfo=None
            )
        except ValueError:
            pass
    return datetime.utcnow()


def split_content_type(content_type: Optional[str]) -> Dict[str, str]:
    value = content_type or "application/octet-stream"
    main_type = value.split("/", 1)[0] if "/" in value else value
    return {"content_type": value, "main_type": main_type}


def normalize_status(document: Dict[str, Any], public_key: str = "public") -> str:
    """Map v1 visibility/status flags to v2 status names."""

    status = str(document.get("status") or "").upper()
    if document.get(public_key) is True or status == "PUBLIC":
        return "PUBLIC"
    if status == "AUTHENTICATED":
        return "AUTHENTICATED"
    if status in {"DEFAULT", "TRIAL"}:
        return "AUTHENTICATED"
    return "PRIVATE"


def extract_email(value: Any, fallback: str) -> str:
    """Extract an email from v1 MiniUser/user-like shapes.

    Handles several v1 MiniUser layouts:
    - {"email": "user@example.com", ...}
    - {"identityId": "user@example.com", ...}
    - {"identityId": {"userId": "user@example.com", "providerId": "..."}, ...}
    - {"id": "user@example.com", ...}
    """
    if isinstance(value, str) and "@" in value:
        return value.lower()
    if isinstance(value, dict):
        for key in ("email", "emailAddress"):
            raw = value.get(key)
            if isinstance(raw, str) and "@" in raw:
                return raw.lower()
        # identityId can be a plain email string or a nested {"userId": "..."} object
        identity = value.get("identityId")
        if isinstance(identity, str) and "@" in identity:
            return identity.lower()
        if isinstance(identity, dict):
            user_id = identity.get("userId") or identity.get("id") or ""
            if isinstance(user_id, str) and "@" in user_id:
                return user_id.lower()
        for key in ("id",):
            raw = value.get(key)
            if isinstance(raw, str) and "@" in raw:
                return raw.lower()
    return fallback.lower()


def user_out(
    email: str, first_name: str = "", last_name: str = "", **extra: Any
) -> Dict[str, Any]:
    """Build the embedded v2 UserOut-shaped dict used by migrated resources."""

    return {
        "email": email,
        "first_name": first_name or email.split("@", 1)[0],
        "last_name": last_name or "Migrated",
        "admin": bool(extra.get("admin", False)),
        "admin_mode": bool(extra.get("admin_mode", False)),
        "read_only_user": bool(extra.get("read_only_user", False)),
    }
