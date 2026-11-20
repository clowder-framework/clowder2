# Clowder v1 to v2 migration

Move datasets, files, folders, metadata, tags, users, and spaces from a
Clowder v1 instance into Clowder v2.

```bash
python -m scripts.v1_to_v2_migration api
python -m scripts.v1_to_v2_migration api --limit 5
python -m scripts.v1_to_v2_migration api-inventory --print
python -m scripts.v1_to_v2_migration cleanup-keys
python -m scripts.v1_to_v2_migration mongo-bridge
```

Set `MIGRATION_DRY_RUN=1` to walk the source without writing to v2.

## Environment

API path:

| Variable | Purpose |
|---|---|
| `CLOWDER1_BASE_URL` | v1 API base URL |
| `CLOWDER1_API_KEY` | v1 admin API key (`superAdmin` is sent on every v1 call) |
| `CLOWDER1_USERNAME` / `CLOWDER1_PASSWORD` | optional v1 Basic auth |
| `CLOWDER2_BASE_URL` | v2 backend API (`…/api/v2`, not the frontend) |
| `CLOWDER2_API_KEY` | v2 admin API key |
| `CLOWDER2_ADMIN_EMAIL` / `CLOWDER2_ADMIN_PASSWORD` | used when no v2 admin API key is set |
| `CLOWDER2_OWNER_PASSWORDS` | optional JSON map of `{email: password}` for existing v2 users |
| `CLOWDER2_LICENSE_ID` | optional; otherwise the first standard license is used |
| `MIGRATION_CHECKPOINT` | default `migration-checkpoint.json` |
| `MIGRATION_OUTPUT_DIR` | default `migration-output` |

Mongo path additionally needs `CLOWDER1_MONGODB_URL`, `CLOWDER2_MONGODB_URL`,
MinIO settings, and optionally Elasticsearch.

## Credential files

The migrator writes secrets under `MIGRATION_OUTPUT_DIR`:

- `generated-owner-passwords.json` — plaintext passwords for users created during migration
- `user-api-keys.json` — raw v2 API keys named `migration` (present only while a run is in progress)

Those files are created with mode `0600`. Gitignore covers the default output
directory plus `**/generated-owner-passwords.json`, `**/user-api-keys.json`,
and `**/migration-checkpoint.json` so a custom output path is less likely to
be committed.

Treat the output directory as sensitive:

1. Restrict who can read the host (and any volume the directory lives on).
2. Do not copy credential files into tickets, CI logs, or shared drives.
3. After a successful migration, delete `generated-owner-passwords.json` once
   users have rotated passwords (or Keycloak accounts have been provisioned).
4. The API path revokes `migration` keys at the end of each run. If a run
   crashes, run `cleanup-keys` so leftover keys do not remain valid.

`api-inventory --print` emits only dataset ids and a count, not full v1
dataset objects.

## API path behavior that affects security

- Per-owner v2 API keys expire after 7 days and are deleted when the run
  finishes. They are created only for users who own a dataset being migrated.
- A dataset is **not** migrated under the admin account if the owner's key
  cannot be created. Fix that owner's password (via `CLOWDER2_OWNER_PASSWORDS`
  or the generated file) and resume.
- The v1 admin API key used here can list and download all v1 data. Store it
  in the environment, not in source, and rotate it after migration.

## Mongo path passwords

Mongo-bridge users get a unique random local password (never a shared default)
written to `generated-owner-passwords.json`. Login in Clowder v2 is Keycloak
backed, and these users are inserted with `keycloak_id` unset, so they cannot
sign in until an operator provisions them in Keycloak and rotates credentials.
Do not hand out the generated file as a long-term password store; delete it
after accounts are provisioned.
