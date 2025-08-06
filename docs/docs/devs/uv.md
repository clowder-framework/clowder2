# Building with uv

Migrating to https://docs.astral.sh/uv/.

1. [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
2. Install dependencies: `uv sync --dev`
3. Activate environment: `source .venv/bin/activate`

To upgrade a package to the latest version matching the settings in pyproject.toml,
run `uv lock --upgrade-package <package>`.

To upgrade all packages to the latest version matching the settings in pyproject.toml,  run `uv lock --upgrade`.
