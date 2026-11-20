"""API-first migration workflow from Clowder v1 to Clowder v2."""

from __future__ import annotations

import json
import secrets
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from .api_clients import ApiError, ClowderV1Client, ClowderV2Client
from .checkpoint import Checkpoint
from .config import ApiConfig
from .utils import (
    extract_email,
    first_present,
    harden_secret_file,
    normalize_status,
    sanitize_error,
    secure_temp_file,
    stringify_id,
    write_secret_json,
)

_MIGRATION_API_KEY_NAME = "migration"
# Long enough for a full migration; leftover keys still expire if cleanup is skipped.
_MIGRATION_API_KEY_TTL_MINUTES = 7 * 24 * 60
_OWNER_PASSWORDS_FILENAME = "generated-owner-passwords.json"
_USER_API_KEYS_FILENAME = "user-api-keys.json"

_LEGACY_CONTEXT = [{"legacy": "https://clowderframework.org/legacy#"}]
_TAGS_CONTEXT = [{"tags": "http://www.w3.org/2004/02/skos/core#prefLabel"}]
_PROVENANCE_CONTEXT = [
    {
        "clowder_v1_id": "https://clowderframework.org/legacy#v1_id",
        "clowder_v1_spaces": "https://clowderframework.org/legacy#v1_spaces",
        "clowder_v1_collections": "https://clowderframework.org/legacy#v1_collections",
    }
]

# Synthetic listeners attached to migrated metadata. Clowder v2 only renders a
# metadata entry in the "Machine Metadata" tab when agent.listener is non-null,
# and in the "User Metadata" tab only when it matches a registered metadata
# definition. Migrated v1 metadata has no v2 definition, so we mark it as
# listener-sourced to make it visible (rendered as a JSON tree).
_MIGRATION_LISTENER = {
    "name": "Clowder v1 Migration",
    "version": "1.0",
    "description": "Metadata migrated from Clowder v1",
}
_EXTRACTION_LISTENER = {
    "name": "Clowder v1 Extraction",
    "version": "1.0",
    "description": "Extraction metadata migrated from Clowder v1",
}
_PROVENANCE_LISTENER = {
    "name": "Clowder v1 Provenance",
    "version": "1.0",
    "description": "Provenance recorded during Clowder v1 to v2 migration",
}
_TAGS_LISTENER = {
    "name": "Clowder v1 Tags",
    "version": "1.0",
    "description": "Tags migrated from Clowder v1",
}

# A dataset is checkpointed under "datasets" only after every phase below has
# finished. The v2 id is stored earlier, under "dataset_state", so a crashed
# run can resume folders/files/metadata on the same dataset. Writing the v2 id
# into "datasets" immediately after create_dataset made resume skip the
# half-finished dataset, and --force then called create_dataset again.
_DATASET_PHASES = (
    "created",
    "provenance",
    "folders",
    "files",
    "metadata",
    "tags",
    "comments",
    "complete",
)


def _phase_finished(completed: Optional[str], phase: str) -> bool:
    """Return whether *phase* is already included in *completed*."""
    if completed not in _DATASET_PHASES:
        return False
    return _DATASET_PHASES.index(completed) >= _DATASET_PHASES.index(phase)


class ApiMigrator:
    """Coordinates the REST API migration path."""

    def __init__(self, config: ApiConfig, *, connect_v2: bool = True):
        self.config = config
        self.checkpoint = Checkpoint(config.checkpoint_path)
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        self.comments_dir = self.config.output_dir / "comments"
        self.comments_dir.mkdir(parents=True, exist_ok=True)
        self.v1 = ClowderV1Client(
            config.clowder1_url,
            api_key=config.clowder1_api_key,
            username=config.clowder1_username,
            password=config.clowder1_password,
            timeout=config.timeout_seconds,
        )
        # api-inventory only lists v1 datasets. Skip the v2 client so that
        # command can run before CLOWDER2_BASE_URL or v2 credentials exist.
        self.v2_admin: Optional[ClowderV2Client] = None
        if connect_v2:
            if not config.clowder2_url:
                raise RuntimeError("CLOWDER2_BASE_URL is required for this command.")
            self.v2_admin = ClowderV2Client(
                config.clowder2_url,
                api_key=config.clowder2_api_key,
                timeout=config.timeout_seconds,
            )
            if (
                not config.clowder2_api_key
                and config.clowder2_admin_email
                and config.clowder2_admin_password
            ):
                self.v2_admin.bearer_token = self.v2_admin.login(
                    config.clowder2_admin_email,
                    config.clowder2_admin_password,
                )
        self.owner_passwords = self._load_owner_passwords()
        # Populated by sync_spaces(); maps v1_space_id -> space dict
        self._space_lookup: Dict[str, Dict[str, Any]] = {}
        # Populated by sync_users(); maps v1 user ObjectId -> email
        self._v1_user_id_email: Dict[str, str] = {}
        # Per-user v2 API keys (email → key); created once in sync_users() and
        # reused for all operations within each user's datasets.
        self._user_api_keys: Dict[str, str] = {}
        keys_path = self._user_api_keys_path()
        if keys_path.exists():
            harden_secret_file(keys_path)
            self._user_api_keys.update(json.loads(keys_path.read_text()))
        # Records every item that failed to migrate so failures are visible and
        # countable instead of vanishing into a lone SKIP log line.
        self.failures: List[Dict[str, Any]] = []
        # Emails for which an API-key login already failed this run. Without
        # this, an owner whose real Keycloak password we don't know (e.g. a
        # pre-existing account with a generated placeholder password) gets a
        # fresh failed login attempt for every dataset they own — hammering
        # Keycloak with bad credentials against a real account and risking a
        # brute-force lockout.
        self._api_key_login_failed: set = set()

    def _record_failure(
        self, kind: str, v1_id: str, detail: str, exc: BaseException
    ) -> None:
        """Record and log a per-item migration failure without aborting the run."""
        error = sanitize_error(exc)
        self.failures.append(
            {
                "kind": kind,
                "v1_id": v1_id,
                "detail": detail,
                "error": error,
            }
        )
        print(f"  FAIL {kind} {v1_id} ({detail}): {error}")

    def _write_failure_report(self) -> None:
        """Print an aggregate summary and write failures to a JSON file."""
        path = self.config.output_dir / "failures.json"
        write_secret_json(path, self.failures)
        if self.failures:
            by_kind: Dict[str, int] = {}
            for f in self.failures:
                by_kind[f["kind"]] = by_kind.get(f["kind"], 0) + 1
            breakdown = ", ".join(f"{k}={v}" for k, v in sorted(by_kind.items()))
            print(
                f"\nMigration completed with {len(self.failures)} failure(s) "
                f"({breakdown}). See {path}."
            )
        else:
            print("\nMigration completed with no recorded failures.")

    def close(self) -> None:
        self.v1.close()
        if self.v2_admin is not None:
            self.v2_admin.close()

    def _owner_passwords_path(self) -> Path:
        return self.config.output_dir / _OWNER_PASSWORDS_FILENAME

    def _user_api_keys_path(self) -> Path:
        return self.config.output_dir / _USER_API_KEYS_FILENAME

    def _persist_user_api_keys(self) -> None:
        write_secret_json(self._user_api_keys_path(), self._user_api_keys)

    def _load_owner_passwords(self) -> Dict[str, str]:
        passwords: Dict[str, str] = {}
        generated = self._owner_passwords_path()
        if generated.exists():
            harden_secret_file(generated)
            passwords.update(json.loads(generated.read_text()))
        if (
            self.config.owner_passwords_path
            and self.config.owner_passwords_path.exists()
        ):
            harden_secret_file(self.config.owner_passwords_path)
            passwords.update(json.loads(self.config.owner_passwords_path.read_text()))
        return passwords

    def inventory(self, limit: int | None = None) -> List[Dict[str, Any]]:
        datasets = self.v1.list_datasets(limit=limit)
        manifest = {
            "datasets": len(datasets),
            "ids": [stringify_id(first_present(ds, ("id", "_id"))) for ds in datasets],
        }
        (self.config.output_dir / "inventory.json").write_text(
            json.dumps(manifest, indent=2)
        )
        return datasets

    def sync_users(
        self, datasets: Iterable[Dict[str, Any]], full_user_list: bool = True
    ) -> Dict[str, str]:
        existing_v2 = {
            user.get("email", "").lower()
            for user in self.v2_admin.list_users()
            if user.get("email")
        }

        # Collect users: optionally from the full v1 user list (admin key
        # required), then fill in any dataset authors not already covered.
        candidates: Dict[str, Tuple[str, str]] = {}
        if full_user_list:
            for v1_user in self.v1.list_users():
                email = extract_email(v1_user, fallback="")
                if not email or email == "migration@localhost.localdomain":
                    continue
                candidates[email] = self._name_parts(v1_user, email)
                # Build v1 user ObjectId → email map so authorId can be resolved
                for id_key in ("id", "_id"):
                    uid = stringify_id(v1_user.get(id_key))
                    if uid:
                        self._v1_user_id_email[uid] = email

        datasets = list(datasets)
        for dataset in datasets:
            author_id = stringify_id(dataset.get("authorId"))
            if author_id and author_id not in self._v1_user_id_email:
                v1_user = self.v1.get_user(author_id)
                if isinstance(v1_user, dict):
                    email = extract_email(v1_user, fallback="")
                    if email:
                        self._v1_user_id_email[author_id] = email
                        candidates[email] = self._name_parts(v1_user, email)
            author = dataset.get("author") or dataset.get("creator") or {}
            email = extract_email(author, fallback="migration@localhost.localdomain")
            if email not in candidates:
                candidates[email] = self._name_parts(author, email)

        credentials: Dict[str, str] = dict(self.owner_passwords)
        total = len(candidates)
        for idx, (email, (first_name, last_name)) in enumerate(
            candidates.items(), start=1
        ):
            if idx % 25 == 0 or idx == total:
                print(f"  users: {idx}/{total}")
            if self.config.dry_run:
                # Do not mint or persist passwords. A dry run must not leave
                # plaintext credentials on disk for users it never creates.
                self.checkpoint.set(
                    "users", email, {"email": email, "existing": email in existing_v2}
                )
                continue
            if email not in credentials:
                credentials[email] = secrets.token_urlsafe(18)
            if email not in existing_v2:
                try:
                    user = self.v2_admin.create_user(
                        email,
                        credentials[email],
                        first_name,
                        last_name,
                    )
                except ApiError as exc:
                    # 409 means the user already exists in Keycloak — that's a
                    # success for our purposes, not a failed creation. Only a
                    # non-conflict error is a genuine failure worth flagging.
                    if exc.status_code == 409:
                        user = {"email": email, "existing": True}
                    else:
                        user = {
                            "email": email,
                            "created": False,
                            "error": f"{type(exc).__name__}: {exc}",
                        }
                self.checkpoint.set("users", email, user)
            else:
                self.checkpoint.set("users", email, {"email": email, "existing": True})
            # NOTE: API keys are NOT created here. Only actual dataset owners
            # need a key, and each key requires a Keycloak login round-trip.
            # Creating keys for all users up front front-loads hundreds of
            # logins before the first dataset migrates. Keys are instead created
            # lazily in _owner_client() the first time a user owns a dataset.

        if not self.config.dry_run:
            write_secret_json(self._owner_passwords_path(), credentials)
        self.owner_passwords = credentials
        return credentials

    def sync_listeners(self) -> None:
        """Register the synthetic listeners used to attribute migrated metadata.

        The file metadata endpoint (POST /files/{id}/metadata) rejects a body
        whose listener name/version is not already a registered EventListener
        (404 "Extractor not found"). Register them once so both dataset and file
        metadata land in the Machine Metadata tab.
        """
        if self.config.dry_run:
            return
        listeners = [
            _MIGRATION_LISTENER,
            _EXTRACTION_LISTENER,
            _PROVENANCE_LISTENER,
            _TAGS_LISTENER,
        ]
        existing = {
            (item.get("name"), str(item.get("version")))
            for item in self.v2_admin.list_listeners()
        }
        for listener in listeners:
            key = (listener["name"], str(listener["version"]))
            if key in existing:
                continue
            try:
                self.v2_admin.create_listener(dict(listener))
            except ApiError:
                pass

    def sync_spaces(self) -> None:
        """Create v2 groups for each v1 Space and add space members."""
        spaces = self.v1.list_spaces()
        for space in spaces:
            v1_space_id = stringify_id(first_present(space, ("id", "_id")))
            if not v1_space_id:
                continue
            self._space_lookup[v1_space_id] = space

            if isinstance(self.checkpoint.get("groups", v1_space_id), str):
                continue

            if self.config.dry_run:
                self.checkpoint.set(
                    "groups", v1_space_id, {"dry_run": space.get("name")}
                )
                continue

            try:
                group = self.v2_admin.create_group(
                    name=space.get("name") or f"Space {v1_space_id}",
                    description=space.get("description") or "",
                )
                v2_group_id = group["id"]
                self.checkpoint.set("groups", v1_space_id, v2_group_id)
            except ApiError:
                continue

            for user in self.v1.list_space_users(v1_space_id):
                email = extract_email(user, fallback="")
                if not email:
                    continue
                try:
                    self.v2_admin.add_group_member(v2_group_id, email)
                except ApiError:
                    pass

    def migrate(self, force: bool = False, limit: int | None = None) -> None:
        datasets = self.inventory(limit=limit)
        if limit is not None:
            print(f"Limiting migration to {len(datasets)} dataset(s).")
        self.sync_users(datasets, full_user_list=(limit is None))
        self.sync_listeners()
        if limit is None:
            self.sync_spaces()
        license_id = self.config.license_id or self.v2_admin.standard_license_id()
        if not license_id:
            raise RuntimeError("No v2 license id found. Set CLOWDER2_LICENSE_ID.")

        for dataset in datasets:
            v1_dataset_id = stringify_id(first_present(dataset, ("id", "_id")))
            if not v1_dataset_id:
                continue
            _v2_id, phase = self._dataset_progress(v1_dataset_id)
            # Only a fully finished dataset is skipped. An in-progress v2 id
            # must be reused so resume fills in the rest instead of creating
            # another dataset. --force re-enters finished datasets the same way.
            if phase == "complete" and not force:
                continue
            # v1 list response includes authorId (ObjectId) but not the full author
            # object. Resolve via the user map built in sync_users().
            author_id = stringify_id(dataset.get("authorId"))
            owner_email = self._v1_user_id_email.get(author_id or "") or extract_email(
                dataset.get("author") or dataset.get("creator") or {},
                fallback="migration@localhost.localdomain",
            )
            ds_name = first_present(dataset, ("name", "title")) or v1_dataset_id
            owner_client: Optional[ClowderV2Client] = None
            if self.config.dry_run:
                print(f"  owner: {owner_email}  dataset: {ds_name}")
            else:
                owner_client = self._owner_client(owner_email)
                if owner_client is None:
                    self._record_failure(
                        "dataset",
                        v1_dataset_id,
                        ds_name,
                        RuntimeError(
                            f"no v2 API key for owner {owner_email}; "
                            "dataset not migrated to avoid admin attribution"
                        ),
                    )
                    continue
                print(f"  owner: {owner_email}  key: ok  dataset: {ds_name}")
            try:
                self._migrate_dataset(
                    owner_client, owner_email, dataset, v1_dataset_id, license_id
                )
            except Exception as exc:
                # One failing dataset must never abort the whole run. Record it
                # and move on; a later resume retries datasets that are not
                # marked complete.
                self._record_failure("dataset", v1_dataset_id, ds_name, exc)
            finally:
                if owner_client is not None:
                    owner_client.close()

        try:
            if limit is None:
                self._grant_space_group_roles()
        finally:
            self._write_failure_report()
            self.revoke_migration_keys()

    def _login_as(
        self, email: str, credentials: Dict[str, str]
    ) -> Optional[ClowderV2Client]:
        """Return a v2 client authenticated as *email* via bearer token, or None."""
        password = credentials.get(email)
        if not password:
            return None
        try:
            token = self.v2_admin.login(email, password)
            return self.v2_admin.as_user(token)
        except ApiError:
            return None

    def _ensure_api_key(self, email: str) -> Optional[str]:
        """Return a time-limited v2 API key for *email*, creating one on demand.

        Keys are created lazily (only for users who actually own a dataset)
        rather than for every v1 user up front, since each key costs a Keycloak
        login. Newly created keys are persisted to user-api-keys.json with mode
        0600 and revoked at the end of the run.
        """
        api_key = self._user_api_keys.get(email)
        if api_key:
            return api_key
        if email in self._api_key_login_failed:
            return None
        bearer_client = self._login_as(email, self.owner_passwords)
        if bearer_client is None:
            self._api_key_login_failed.add(email)
            return None
        try:
            key = bearer_client.create_api_key(
                _MIGRATION_API_KEY_NAME, mins=_MIGRATION_API_KEY_TTL_MINUTES
            )
            self._user_api_keys[email] = key
        except ApiError:
            self._api_key_login_failed.add(email)
            return None
        finally:
            bearer_client.close()
        self._persist_user_api_keys()
        return self._user_api_keys[email]

    def _invalidate_owner_key(self, email: str) -> None:
        """Drop a cached API key that the backend has rejected (e.g. expired).

        Expired or otherwise rejected keys stay in user-api-keys.json unless
        cleared — without this, _ensure_api_key would keep returning the same
        dead key forever. Clearing both caches lets the next _owner_client()
        call log in again and mint a fresh one.
        """
        self._user_api_keys.pop(email, None)
        self._api_key_login_failed.discard(email)
        self._persist_user_api_keys()

    def _owner_client(self, email: str) -> Optional[ClowderV2Client]:
        """Return a long-lived client for *email*, or None if no per-user key."""
        api_key = self._ensure_api_key(email)
        if not api_key:
            return None
        return ClowderV2Client(
            self.config.clowder2_url,
            api_key=api_key,
            timeout=self.config.timeout_seconds,
        )

    def revoke_migration_keys(self) -> None:
        """Delete leftover keys named 'migration' so they do not outlive the run."""
        if self.config.dry_run:
            return
        remaining: Dict[str, str] = {}
        revoked = 0
        for email, api_key in list(self._user_api_keys.items()):
            client = ClowderV2Client(
                self.config.clowder2_url,
                api_key=api_key,
                timeout=self.config.timeout_seconds,
            )
            try:
                for key in client.list_api_keys():
                    if key.get("name") != _MIGRATION_API_KEY_NAME:
                        continue
                    key_id = key.get("id")
                    if not key_id:
                        continue
                    client.delete_api_key(str(key_id))
                    revoked += 1
            except ApiError as exc:
                remaining[email] = api_key
                print(
                    f"  WARN could not revoke migration API key for {email}: "
                    f"{sanitize_error(exc)}"
                )
            finally:
                client.close()
        self._user_api_keys = remaining
        keys_path = self._user_api_keys_path()
        if remaining:
            self._persist_user_api_keys()
        elif keys_path.exists():
            keys_path.unlink()
        if revoked:
            print(f"Revoked {revoked} migration API key(s).")

    def _migrate_dataset(
        self,
        owner_client: Optional[ClowderV2Client],
        owner_email: str,
        dataset: Dict[str, Any],
        v1_dataset_id: str,
        license_id: str,
    ) -> None:
        dataset_body = {
            "name": first_present(dataset, ("name", "title"))
            or f"Dataset {v1_dataset_id}",
            "description": dataset.get("description") or "",
            "status": normalize_status(dataset),
        }
        if self.config.dry_run:
            self.checkpoint.set("datasets", v1_dataset_id, {"dry_run": dataset_body})
            return

        # Use the owner's API key client for all operations so every resource
        # (dataset, files, folders, metadata) is attributed to the correct user.
        # Callers must not pass admin here: missing owner keys fail the dataset.
        if owner_client is None:
            raise RuntimeError(
                f"no v2 API key for owner {owner_email}; "
                "dataset not migrated to avoid admin attribution"
            )
        client = owner_client
        # A client this method creates itself (the refreshed replacement below)
        # is this method's own responsibility to close; the caller-supplied
        # owner_client is the caller's responsibility.
        fresh_client: Optional[ClowderV2Client] = None
        v2_dataset_id, phase = self._dataset_progress(v1_dataset_id)
        try:
            if not v2_dataset_id:
                # Dataset creation can 401 either from a transient token-refresh
                # blip or because the cached owner API key has expired mid-run.
                # Retry once before giving up so one bad request doesn't defer a
                # dataset to a later resume run. Safe to retry here specifically:
                # nothing is created until create_dataset returns, so a retry can
                # never duplicate work. A later resume reuses the stored id.
                try:
                    created = client.create_dataset(dataset_body, license_id)
                except ApiError as exc:
                    if exc.status_code != 401:
                        raise
                    # A per-user key was rejected — it may be expired. Drop it
                    # and mint a fresh one rather than retrying with the same
                    # dead key, which would just fail again.
                    self._invalidate_owner_key(owner_email)
                    fresh_client = self._owner_client(owner_email)
                    if fresh_client is None:
                        raise RuntimeError(
                            f"no v2 API key for owner {owner_email} after 401; "
                            "dataset not migrated to avoid admin attribution"
                        ) from exc
                    client = fresh_client
                    created = client.create_dataset(dataset_body, license_id)
                v2_dataset_id = created["id"]
                phase = None
            if not _phase_finished(phase, "created"):
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "created")
                phase = "created"
            if not _phase_finished(phase, "provenance"):
                self._migrate_provenance_metadata(
                    client, dataset, v1_dataset_id, v2_dataset_id
                )
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "provenance")
                phase = "provenance"
            if not _phase_finished(phase, "folders"):
                self._migrate_folders(client, v1_dataset_id, v2_dataset_id)
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "folders")
                phase = "folders"
            if not _phase_finished(phase, "files"):
                self._migrate_files(client, v1_dataset_id, v2_dataset_id)
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "files")
                phase = "files"
            if not _phase_finished(phase, "metadata"):
                self._migrate_metadata(
                    client.add_dataset_metadata,
                    "datasets",
                    v1_dataset_id,
                    v2_dataset_id,
                )
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "metadata")
                phase = "metadata"
            if not _phase_finished(phase, "tags"):
                self._migrate_tags_as_metadata(
                    client.add_dataset_metadata,
                    "datasets",
                    v1_dataset_id,
                    v2_dataset_id,
                )
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "tags")
                phase = "tags"
            if not _phase_finished(phase, "comments"):
                self._export_comment_sidecar("dataset", v1_dataset_id)
                self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "comments")
            self._mark_dataset_phase(v1_dataset_id, v2_dataset_id, "complete")
        finally:
            if fresh_client is not None:
                fresh_client.close()

    def _dataset_progress(
        self, v1_dataset_id: str
    ) -> Tuple[Optional[str], Optional[str]]:
        """Return the stored v2 dataset id and the last finished phase.

        A legacy checkpoint that stored only the v2 id under "datasets" is
        treated as complete so an already-finished run is not repeated.
        """
        state = self.checkpoint.get("dataset_state", v1_dataset_id)
        if isinstance(state, dict):
            v2_id = state.get("v2_id")
            phase = state.get("phase")
            if isinstance(v2_id, str) and isinstance(phase, str):
                return v2_id, phase
        legacy = self.checkpoint.get("datasets", v1_dataset_id)
        if isinstance(legacy, str):
            return legacy, "complete"
        return None, None

    def _mark_dataset_phase(
        self, v1_dataset_id: str, v2_dataset_id: str, phase: str
    ) -> None:
        """Record phase progress. The resumable id map is written only at the end."""
        self.checkpoint.set(
            "dataset_state",
            v1_dataset_id,
            {"v2_id": v2_dataset_id, "phase": phase},
        )
        if phase == "complete":
            self.checkpoint.set("datasets", v1_dataset_id, v2_dataset_id)

    def _migrate_provenance_metadata(
        self,
        v2: ClowderV2Client,
        dataset: Dict[str, Any],
        v1_dataset_id: str,
        v2_dataset_id: str,
    ) -> None:
        """Post a metadata entry recording the v1 origin and hierarchy names."""
        space_ids: List[str] = [
            stringify_id(s) or "" for s in (dataset.get("spaces") or [])
        ]
        space_names: List[str] = [
            self._space_lookup.get(sid, {}).get("name") or sid
            for sid in space_ids
            if sid
        ]
        collection_names: List[str] = [
            (c.get("name") if isinstance(c, dict) else str(c))
            for c in (dataset.get("collections") or [])
        ]
        content: Dict[str, Any] = {"clowder_v1_id": v1_dataset_id}
        if space_names:
            content["clowder_v1_spaces"] = space_names
        if collection_names:
            content["clowder_v1_collections"] = collection_names
        try:
            v2.add_dataset_metadata(
                v2_dataset_id,
                {
                    "content": content,
                    "@context": _PROVENANCE_CONTEXT,
                    "listener": _PROVENANCE_LISTENER,
                },
            )
        except ApiError:
            pass

    @staticmethod
    def _reconstruct_folder_paths(folders: List[Dict[str, Any]]) -> Dict[str, str]:
        """Map each v1 folder id to its true path, e.g. "/venv/Lib/site-packages".

        The v1 folders endpoint returns only {id, name} — no parentId — and
        `name` is a concatenation of every ancestor's display name plus the
        folder's own ("/<parent display>/<own display>"). Display names from
        zip-style uploads themselves contain the full relative path, which is
        why raw names look duplicated ("/venv/Lib/venv/Lib/site-packages").

        Reconstruction: a folder's parent is the other folder whose raw name is
        the longest strict "/"-boundary prefix of its own; the display name is
        the remainder; and the true path is the parent's true path plus the
        display name with the parent's display-name prefix stripped (when the
        display name embeds it).
        """
        raw_names: Dict[str, str] = {}
        for folder in folders:
            fid = stringify_id(first_present(folder, ("id", "_id")))
            name = str(first_present(folder, ("name", "foldername")) or "").rstrip("/")
            if not fid or not name:
                continue
            if not name.startswith("/"):
                name = "/" + name
            raw_names[fid] = name

        names = sorted(set(raw_names.values()), key=len)

        def parent_of(name: str) -> Optional[str]:
            best = None
            for cand in names:
                if cand != name and name.startswith(cand + "/"):
                    if best is None or len(cand) > len(best):
                        best = cand
            return best

        display: Dict[str, str] = {}
        for name in names:  # shortest first, so parents resolve before children
            parent = parent_of(name)
            display[name] = name[len(parent) + 1 :] if parent else name.lstrip("/")

        true_path: Dict[str, str] = {}
        for name in names:
            parent = parent_of(name)
            own = display[name]
            if parent:
                parent_display = display[parent]
                if own.startswith(parent_display + "/"):
                    own = own[len(parent_display) + 1 :]
                true_path[name] = true_path[parent] + "/" + own
            else:
                true_path[name] = "/" + own

        return {fid: true_path[name] for fid, name in raw_names.items()}

    def _migrate_folders(
        self,
        v2: ClowderV2Client,
        v1_dataset_id: str,
        v2_dataset_id: str,
    ) -> None:
        folders = self.v1.list_dataset_folders(v1_dataset_id)
        paths = self._reconstruct_folder_paths(folders)

        # v2 folder id per true path already created in this dataset. Seed with
        # checkpointed folders so a resumed run reuses them instead of
        # duplicating.
        v2_id_by_path: Dict[str, str] = {}
        for v1_folder_id, path in paths.items():
            existing = self.checkpoint.get("folders", v1_folder_id)
            if isinstance(existing, str):
                v2_id_by_path.setdefault(path, existing)

        def ensure_path(path: str) -> Optional[str]:
            """Create every missing segment of *path*; return the leaf's v2 id."""
            current: Optional[str] = None
            walked = ""
            for segment in (s for s in path.split("/") if s):
                walked += "/" + segment
                if walked in v2_id_by_path:
                    current = v2_id_by_path[walked]
                    continue
                created = v2.create_folder(
                    v2_dataset_id, {"name": segment, "parent_folder": current}
                )
                current = created["id"]
                v2_id_by_path[walked] = current
            return current

        for v1_folder_id, path in paths.items():
            if self.checkpoint.contains("folders", v1_folder_id):
                continue
            try:
                v2_folder_id = ensure_path(path)
            except ApiError as exc:
                self._record_failure("folder", v1_folder_id, path, exc)
                continue
            if v2_folder_id:
                self.checkpoint.set("folders", v1_folder_id, v2_folder_id)

    def _migrate_files(
        self,
        v2: ClowderV2Client,
        v1_dataset_id: str,
        v2_dataset_id: str,
    ) -> None:
        for file_doc in self.v1.list_dataset_files(v1_dataset_id):
            v1_file_id = stringify_id(first_present(file_doc, ("id", "_id")))
            if not v1_file_id or self.checkpoint.contains("files", v1_file_id):
                continue
            filename = (
                first_present(file_doc, ("filename", "name", "originalname"))
                or v1_file_id
            )
            content_type = first_present(file_doc, ("contentType", "content_type"))
            # v1 file docs reference their containing folder as a nested
            # {"folders": {"id": ..., "name": ...}} object (not folderId).
            folder_ref = file_doc.get("folders")
            if isinstance(folder_ref, list):
                folder_ref = folder_ref[0] if folder_ref else None
            if isinstance(folder_ref, dict):
                v1_folder_id = stringify_id(first_present(folder_ref, ("id", "_id")))
            else:
                v1_folder_id = stringify_id(
                    first_present(file_doc, ("folderId", "folder_id"))
                )
            v2_folder_id = (
                self.checkpoint.get("folders", v1_folder_id) if v1_folder_id else None
            )
            if v2_folder_id and "/" in filename:
                # Zip-style v1 uploads store the full relative path in the
                # filename; inside a real folder tree only the basename is the
                # file's name.
                filename = filename.rsplit("/", 1)[-1] or filename
            tmp_path = secure_temp_file()
            try:
                self.v1.download_file_to(v1_file_id, tmp_path)
                created = v2.upload_file(
                    v2_dataset_id,
                    tmp_path,
                    filename,
                    content_type,
                    folder_id=v2_folder_id,
                )
            except Exception as exc:
                self._record_failure("file", v1_file_id, filename, exc)
                continue
            finally:
                tmp_path.unlink(missing_ok=True)
            v2_file_id = created["id"]
            self.checkpoint.set("files", v1_file_id, v2_file_id)
            self._migrate_metadata(
                v2.add_file_metadata, "files", v1_file_id, v2_file_id
            )
            self._migrate_tags_as_metadata(
                v2.add_file_metadata, "files", v1_file_id, v2_file_id
            )
            self._migrate_file_thumbnails(v2, v1_file_id, v2_file_id)
            self._export_comment_sidecar("file", v1_file_id)

    def _migrate_metadata(
        self,
        add_metadata,
        resource_type: str,
        v1_resource_id: str,
        v2_resource_id: str,
    ) -> None:
        for payload in self.v1.metadata_candidates(resource_type, v1_resource_id):
            metadata = self._metadata_body(payload)
            if metadata:
                try:
                    add_metadata(v2_resource_id, metadata)
                except ApiError as exc:
                    self._record_failure(
                        f"{resource_type}-metadata", v1_resource_id, "metadata", exc
                    )
        extraction = self.v1.get_extraction_metadata(v1_resource_id)
        if extraction:
            body = self._metadata_body(extraction, legacy=True)
            if body:
                try:
                    add_metadata(v2_resource_id, body)
                except ApiError as exc:
                    self._record_failure(
                        f"{resource_type}-metadata",
                        v1_resource_id,
                        "extraction metadata",
                        exc,
                    )

    def _migrate_tags_as_metadata(
        self,
        add_metadata,
        resource_type: str,
        v1_resource_id: str,
        v2_resource_id: str,
    ) -> None:
        """Fetch v1 tags and store them as a v2 metadata entry."""
        try:
            if resource_type == "datasets":
                tags = self.v1.get_dataset_tags(v1_resource_id)
            else:
                tags = self.v1.get_file_tags(v1_resource_id)
        except ApiError as exc:
            self._record_failure(
                f"{resource_type}-tags", v1_resource_id, "fetch tags", exc
            )
            return
        if not tags:
            return
        try:
            add_metadata(
                v2_resource_id,
                {
                    "content": {"tags": tags},
                    "@context": _TAGS_CONTEXT,
                    "listener": _TAGS_LISTENER,
                },
            )
        except ApiError as exc:
            self._record_failure(
                f"{resource_type}-tags", v1_resource_id, "store tags", exc
            )

    @staticmethod
    def _strip_jsonld_keys(item: Any) -> Any:
        """Remove JSON-LD structural keys from a dict to avoid Elasticsearch type conflicts."""
        if isinstance(item, dict):
            return {
                k: v
                for k, v in item.items()
                if k not in ("@context", "@id", "@type", "@graph")
            }
        return item

    def _metadata_body(
        self, payload: Any, legacy: bool = False
    ) -> Optional[Dict[str, Any]]:
        if isinstance(payload, list):
            # JSON-LD array: extract top-level @context before wrapping.
            # Strip @context from individual items — Elasticsearch cannot handle
            # mixed string/object types for the same field path across documents.
            top_context = None
            cleaned_items = []
            for item in payload:
                if (
                    isinstance(item, dict)
                    and "@context" in item
                    and top_context is None
                ):
                    top_context = item["@context"]
                cleaned_items.append(self._strip_jsonld_keys(item))
            payload = {"items": cleaned_items}
            if top_context is not None:
                payload["@context"] = top_context
        if not isinstance(payload, dict):
            payload = {"value": payload}
        # Prefer the @context from v1; fall back to a generic provenance URL
        context = payload.get("@context") or payload.get("context")
        content = payload.get("content")
        if content is None:
            # Some v1 extractors put data at top level minus bookkeeping keys
            content = {
                k: v
                for k, v in payload.items()
                if k not in ("@context", "context", "agent", "created", "@id", "_id")
            }
        if not content:
            return None
        body: Dict[str, Any] = {
            "content": content,
            "description": "Migrated legacy extraction metadata"
            if legacy
            else "Migrated legacy metadata",
            # Mark as listener-sourced so v2 renders it in the Machine Metadata tab.
            "listener": _EXTRACTION_LISTENER if legacy else _MIGRATION_LISTENER,
        }
        if context:
            body["@context"] = context if isinstance(context, list) else [context]
        else:
            body["context_url"] = "http://clowder.ncsa.illinois.edu/metadata/v1"
        return body

    def _migrate_file_thumbnails(
        self,
        v2: ClowderV2Client,
        v1_file_id: str,
        v2_file_id: str,
    ) -> None:
        previews = self.v1.get_previews(v1_file_id)
        thumbnail_ids = [
            stringify_id(
                first_present(preview, ("thumbnail_id", "thumbnailId", "id", "_id"))
            )
            for preview in previews
        ]
        for thumbnail_id in [value for value in thumbnail_ids if value]:
            tmp_path = secure_temp_file(suffix=".png")
            try:
                if not self.v1.download_thumbnail_to(thumbnail_id, tmp_path):
                    continue
                created = v2.create_thumbnail(tmp_path)
                v2.attach_file_thumbnail(v2_file_id, created["id"])
                self.checkpoint.set("thumbnails", thumbnail_id, created["id"])
            except ApiError:
                pass
            finally:
                tmp_path.unlink(missing_ok=True)
            return  # Only attach the first successfully downloaded thumbnail

    def _grant_space_group_roles(self) -> None:
        """Grant each v2 group VIEWER access to datasets that were in its v1 space."""
        if self.config.dry_run:
            return
        spaces = self.v1.list_spaces()
        for space in spaces:
            v1_space_id = stringify_id(first_present(space, ("id", "_id")))
            if not v1_space_id:
                continue
            v2_group_id = self.checkpoint.get("groups", v1_space_id)
            if not v2_group_id or not isinstance(v2_group_id, str):
                continue
            for ds in self.v1.list_space_datasets(v1_space_id):
                v1_dataset_id = stringify_id(first_present(ds, ("id", "_id")))
                if not v1_dataset_id:
                    continue
                v2_dataset_id = self.checkpoint.get("datasets", v1_dataset_id)
                if not v2_dataset_id or not isinstance(v2_dataset_id, str):
                    continue
                role_key = f"{v1_dataset_id}:{v1_space_id}"
                if self.checkpoint.contains("group_roles", role_key):
                    continue
                try:
                    self.v2_admin.set_dataset_group_role(
                        v2_dataset_id, v2_group_id, "viewer"
                    )
                    self.checkpoint.set("group_roles", role_key, True)
                except ApiError:
                    pass

    def _export_comment_sidecar(self, resource_type: str, v1_resource_id: str) -> None:
        sidecar = self.comments_dir / f"{resource_type}-{v1_resource_id}.json"
        if not sidecar.exists():
            sidecar.write_text(
                json.dumps(
                    {
                        "resource_type": resource_type,
                        "v1_id": v1_resource_id,
                        "comments": [],
                    },
                    indent=2,
                )
            )

    def _name_parts(self, author: Any, email: str) -> Tuple[str, str]:
        if isinstance(author, dict):
            first = first_present(author, ("firstName", "first_name", "givenName"))
            last = first_present(author, ("lastName", "last_name", "familyName"))
            if first or last:
                return str(first or email.split("@", 1)[0]), str(last or "Migrated")
        return email.split("@", 1)[0], "Migrated"
