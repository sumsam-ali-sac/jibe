# Order Portal

Customer portal for placing and managing orders and invoices; staff use the `/admin` area. A filled-in example of Jibe's `CLAUDE.md` template.

## Stack and versions

- Backend: FastAPI 0.115, Pydantic 2.9, pydantic-settings 2.6, SQLAlchemy 2.0 (async, asyncpg), Alembic 1.14, PostgreSQL 16, Redis 7 (cache + task queue via arq).
- Frontend: Next.js 15.1 (App Router), React 19, Tailwind 4, shadcn/ui primitives, TanStack Query 5, react-hook-form 7 + zod 3, API client generated with @hey-api/openapi-ts.
- **Before using any version-specific API, check the installed version in the manifest/lockfile** (and use the docs MCP). Don't assume the latest or an older major.

## Repository layout

- `backend/app/api/v1/` - routers (one per resource); `backend/app/api/deps.py` - shared dependencies (`SessionDep`, `CurrentUser`)
- `backend/app/services/` - business logic; `backend/app/repositories/` - queries; `backend/app/schemas/` - request/response models; `backend/app/models/` - ORM models
- `backend/alembic/versions/` - migrations; `backend/app/worker/` - background jobs
- `frontend/app/(shop)/` customer routes, `frontend/app/admin/` staff routes, `frontend/components/ui/` design-system primitives
- `frontend/lib/api/generated/` - **generated** API client; never edit by hand

## Commands

Run from the repo root.

| Task | Backend | Frontend |
|---|---|---|
| Install | `uv sync --directory backend` | `npm --prefix frontend ci` |
| Dev server | `uv run --directory backend fastapi dev app/main.py` (port 8000) | `npm --prefix frontend run dev` (port 3000) |
| All tests | `uv run --directory backend pytest -q` | `npm --prefix frontend run test` |
| Single test | `uv run --directory backend pytest tests/api/test_orders.py::test_cancel -q` | `npm --prefix frontend run test -- OrderCard` |
| Lint | `uv run --directory backend ruff check .` | `npm --prefix frontend run lint` |
| Format | `uv run --directory backend ruff format .` | `npm --prefix frontend run format` |
| Type check | `uv run --directory backend mypy app` | `npm --prefix frontend run typecheck` |
| E2E | - | `npm --prefix frontend run test:e2e` |
| New migration | `uv run --directory backend alembic revision --autogenerate -m "<msg>"` | - |
| Regenerate API client | - | `npm --prefix frontend run generate:api` (backend must be running) |

**Definition of done:** lint, type check and the relevant tests pass for every side you touched, the API client is regenerated if the backend contract changed, and you have shown the command output.

## Architecture rules

- Backend layering: router (HTTP only) -> service (business rules) -> repository (data access).
- Request/response schemas are separate from ORM models; endpoints always declare their response model.
- The backend OpenAPI schema is the contract; the frontend uses only the generated client.
- Server-rendered by default; client components only at interactive leaves.
- All money is integer cents (`amount_cents`), formatted only in the UI.
- Every query is scoped by `organization_id`; repositories take it as a required argument.
- Durable background work goes through `app/worker` (arq), never `BackgroundTasks`.

## Workflow

- Small, clear change: do it, then verify. Multi-file change: explore, `/plan-feature`, then implement task by task.
- Bugs: failing test first, root-cause fix, keep the test.
- Copy the pattern of the closest existing feature (e.g. invoices) and name the file you followed.
- Stay in scope; mention unrelated problems instead of fixing them.

## Git conventions

| Branch prefix | Use for | Commit subject prefix |
|---|---|---|
| `feature/` | New functionality | `feature:` |
| `bugfix/` | Non-urgent bug fixes | `bugfix:` |
| `hot-fix/` | Urgent production fixes | `hot-fix:` |
| `refactor/` / `chore/` / `docs/` / `test/` / `release/` | As named | same as prefix |

- Branch: `feature/PROJ-142-order-cancellation`. Commit: `feature: add order cancellation endpoint` + body + `Refs: PROJ-142`.
- Integration branch: `develop`. Production branch: `main` (deployed on merge by `.github/workflows/deploy.yml`).
- `hot-fix/` starts from `main`, merges into `main`, then is merged back into `develop`.
- Never `--no-verify`, never force-push shared branches, always ask before pushing. No AI attribution anywhere.

## Delegation

- `searcher`: broad searches. `architect`: plans. `debugger`: root causes. `test-writer`: tests.
- `code-reviewer`, `security-reviewer`, `verifier`, `ui-verifier`: fresh-context checks before shipping. `docs-writer`: docs.

## Environment and secrets

- Config from env vars; `.env` files are never read or edited by Claude. Every variable is documented in `backend/.env.example` and `frontend/.env.example`.
- Only `NEXT_PUBLIC_*` vars reach the browser; never secrets.
- Local services: `docker compose up -d db redis` (Postgres :5432, Redis :6379). Test DB: `docker compose up -d db-test` (:5433).

## Gotchas

- Backend tests need `db-test` running; they fail with a connection error otherwise, not a skip.
- Regenerate the API client after any schema change, or `npm run typecheck` fails in CI.
- Autogenerate misses changes to the `order_status` enum; add `op.execute("ALTER TYPE ...")` manually.
- `frontend/middleware.ts` runs on the edge runtime: no Node APIs there.

## Compaction

When compacting, keep: the current task and plan path, files changed so far, the commands in use, and any failing checks.
