"""JSON checkpoint store for resumable migrations."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional


class Checkpoint:
    """Small JSON-backed store for v1-to-v2 ID maps and migration state."""

    def __init__(self, path: Path):
        self.path = path
        self.data: Dict[str, Any] = {
            "datasets": {},
            "folders": {},
            "files": {},
            "thumbnails": {},
            "users": {},
            "groups": {},
            "comments": {},
        }
        self.load()

    def load(self) -> None:
        if self.path.exists():
            self.data.update(json.loads(self.path.read_text()))

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=2, sort_keys=True))

    def get(self, namespace: str, key: str) -> Optional[Any]:
        return self.data.setdefault(namespace, {}).get(str(key))

    def set(self, namespace: str, key: str, value: Any) -> None:
        self.data.setdefault(namespace, {})[str(key)] = value
        self.save()

    def contains(self, namespace: str, key: str) -> bool:
        return self.get(namespace, key) is not None

    def namespace(self, namespace: str) -> Dict[str, Any]:
        return self.data.setdefault(namespace, {})
