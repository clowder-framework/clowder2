"""Shared normalization helpers for Clowder migration scripts."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, Optional

from bson import ObjectId


UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


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
