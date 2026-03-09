# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Clowder v2 is a cloud-native research data management framework. It manages raw data, complex metadata, and automatic data pipelines via event-driven extractors. The stack is Python/FastAPI (backend) + TypeScript/React (frontend), connected via REST API and RabbitMQ.

## Architecture

### Services (Docker Compose)
- **backend** – FastAPI app serving `/api/v2/...`
- **frontend** – React SPA served via nginx
- **extractors-heartbeat** / **extractors-messages** – microservices tracking extractor liveness and dispatching extraction jobs over RabbitMQ
- **MongoDB** – primary database (via Beanie ODM)
- **MinIO** (4-node cluster behind nginx) – file blob storage
- **Keycloak** – OIDC authentication (backed by PostgreSQL)
- **RabbitMQ** – message bus for extractor communication
- **Elasticsearch** – full-text search index
- **Traefik** – reverse proxy routing everything under port 80

### Backend (`backend/app/`)
- `main.py` – FastAPI app setup; registers all routers and initializes Beanie + Elasticsearch on startup
- `config.py` – All settings via `Settings(BaseSettings)`; env vars override defaults
- `routers/` – One file per resource (`datasets.py`, `files.py`, `listeners.py`, etc.); public routes have a `public_` prefix (no auth required)
- `models/` – Pydantic/Beanie models following the convention:
  - `*Base` – shared fields
  - `*In` – request body
  - `*DB` – MongoDB document (Beanie `Document`)
  - `*FreezeDB` – versioned/frozen copy stored in a separate collection
  - `*Out` – API response
- `keycloak_auth.py` – JWT verification; `get_current_username` is the auth dependency injected on all private routers
- `rabbitmq/` – AMQP publisher for dispatching extraction jobs
- `search/` – Elasticsearch index config and helpers

### Frontend (`frontend/src/`)
- `routes.tsx` – All app routes; `PrivateRoute` wrapper handles auth redirect and token refresh
- `app.config.ts` – Runtime config; `CLOWDER_REMOTE_HOSTNAME` env var sets the API base URL
- `openapi/v2/` – Auto-generated API client from OpenAPI spec (do not edit manually)
- `actions/` – Redux action creators (`.js` files, paired with `.ts` type files in `reducers/`)
- `reducers/` – Redux reducers (TypeScript)
- `components/` – React components organized by domain (`datasets/`, `files/`, `listeners/`, `metadata/`, etc.)
- `metadata.config.tsx` – Registry of metadata widget types
- `visualization.config.ts` – Registry of visualization types

## Development Setup

### Full stack (Docker)
```bash
# Production-like stack
docker compose up

# Development stack (exposes ports for local backend/frontend)
docker compose -f docker-compose.dev.yml up
```

### Backend (local)
Requires: uv, running dev dependencies from `docker-compose.dev.yml`

```bash
cd backend
uv sync --all-extras --dev

# Run backend server
uv run uvicorn app.main:app --reload --port 8000

# Run all tests (requires docker-compose.dev.yml services running)
uv run pytest app/tests/

# Run a single test file
uv run pytest app/tests/test_datasets.py

# Run a single test
uv run pytest app/tests/test_datasets.py::test_create_dataset

# Linting / formatting
uv run ruff check .
uv run black .
```

Tests use a separate `clowder-tests` database and Elasticsearch index (set in `conftest.py`). They use `TestClient` with local auth (not Keycloak).

### Frontend (local)
Requires: Node ≥ 16.15, npm ≥ 8.11

```bash
cd frontend
npm install

# Dev server pointing at local backend (port 8000)
npm run start:dev

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Production build
npm run build
```

### Regenerate OpenAPI client
```bash
cd frontend

# From local backend
npm run codegen:v2:dev

# From local file
npm run codegen:v2:file
```

## Key Conventions

- All private API routes require `Depends(get_current_username)`. Public endpoints are in separate routers with `public_` prefix.
- Dataset versioning ("freezing") stores snapshots in separate `*_freeze` MongoDB collections (e.g., `datasets_freeze`).
- Beanie `View` classes (e.g., `DatasetDBViewList`) are MongoDB views; they are not recreated automatically—drop and recreate manually when the view query changes (see `recreate_views=False` in `main.py`).
- The `CLOWDER_REMOTE_HOSTNAME` env var controls where both the frontend and the OpenAPI codegen point.
- Extractors (now called "listeners") communicate via RabbitMQ. The heartbeat service monitors their liveness; the messages service dispatches jobs.
