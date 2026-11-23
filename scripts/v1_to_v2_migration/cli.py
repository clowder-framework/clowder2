"""Command line entrypoint for Clowder v1 to v2 migration tooling."""

from __future__ import annotations

import argparse
import json
from typing import Sequence

from .api_migrator import ApiMigrator
from .config import ApiConfig, MongoConfig
from .mongo_bridge import MongoBridgeMigrator


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Migrate Clowder v1 data into a Clowder v2 instance."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    api = subparsers.add_parser("api", help="Run API-first migration path.")
    api.add_argument(
        "--force",
        action="store_true",
        help=(
            "Re-enter datasets already marked complete. An existing v2 dataset "
            "is reused instead of creating another one."
        ),
    )
    api.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Migrate at most this many datasets (useful for smoke tests).",
    )

    api_inventory = subparsers.add_parser(
        "api-inventory",
        help="Only inventory v1 datasets through the API.",
    )
    api_inventory.add_argument(
        "--print",
        action="store_true",
        help="Print dataset count and ids to stdout (not full dataset objects).",
    )

    subparsers.add_parser(
        "cleanup-keys",
        help="Revoke leftover 'migration' API keys written to user-api-keys.json.",
    )

    mongo = subparsers.add_parser(
        "mongo-bridge",
        help="Run direct MongoDB/GridFS to MongoDB/MinIO migration path.",
    )
    mongo.add_argument("--force", action="store_true", help="Re-run mapped datasets.")

    mongo_inventory = subparsers.add_parser(
        "mongo-inventory",
        help="Only count relevant v1 MongoDB collections.",
    )
    mongo_inventory.add_argument(
        "--print",
        action="store_true",
        help="Print inventory JSON to stdout.",
    )

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.command == "api":
        migrator = ApiMigrator(ApiConfig.from_env())
        try:
            migrator.migrate(force=args.force, limit=args.limit)
        finally:
            migrator.close()
        return 0

    if args.command == "api-inventory":
        migrator = ApiMigrator(ApiConfig.from_env(require_v2=False), connect_v2=False)
        try:
            inventory = migrator.inventory()
        finally:
            migrator.close()
        if args.print:
            summary = {
                "datasets": len(inventory),
                "ids": [
                    str(ds.get("id") or ds.get("_id") or "")
                    for ds in inventory
                    if ds.get("id") or ds.get("_id")
                ],
            }
            print(json.dumps(summary, indent=2))
        return 0

    if args.command == "cleanup-keys":
        migrator = ApiMigrator(ApiConfig.from_env())
        try:
            migrator.revoke_migration_keys()
        finally:
            migrator.close()
        return 0

    if args.command == "mongo-bridge":
        migrator = MongoBridgeMigrator(MongoConfig.from_env())
        try:
            migrator.migrate(force=args.force)
        finally:
            migrator.close()
        return 0

    if args.command == "mongo-inventory":
        migrator = MongoBridgeMigrator(MongoConfig.from_env())
        try:
            inventory = migrator.dry_run_inventory()
        finally:
            migrator.close()
        if args.print:
            print(json.dumps(inventory, indent=2, default=str))
        return 0

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
