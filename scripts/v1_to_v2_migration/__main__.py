"""Run the Clowder v1 to v2 migration CLI as a module."""

from .cli import main


if __name__ == "__main__":
    raise SystemExit(main())
