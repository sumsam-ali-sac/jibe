# TODO(setup): Project name

> **SETUP (delete this block when done).** Every `TODO(setup):` marker below says what goes there, where to find it, and gives an example.
> 1. Fastest: run `/adapt-setup` in Claude Code. It fills the markers from the repo, verifies the commands, and lists anything it couldn't fill.
> 2. By hand: follow `guides/SETUP-GUIDE.md` in the Jibe repo (one section per marker).
> 3. Check what's left: search this file for `TODO(setup)`. The session-start hook also reminds you while any remain.
>
> Delete rows and sections that don't apply (e.g. no frontend). Keep the file under ~150 lines. Instructions that only matter for some files belong in `.claude/rules/`, not here.

TODO(setup): One or two sentences: what the product does and who uses it. Source: README / product brief. Example: "Customer portal for managing orders and invoices; internal staff use the admin area."

## Stack and versions

- Backend: TODO(setup): API framework + version, validation/settings libraries + versions, ORM + version, database. Source: backend manifest and lockfile. Example: "FastAPI 0.115, Pydantic 2.9, pydantic-settings, SQLAlchemy 2.0 (async), Alembic, PostgreSQL 16".
- Frontend: TODO(setup): framework + version, router style, UI library version, styling, data/forms libraries. Source: frontend package.json. Example: "Next.js 15 (App Router), React 19, Tailwind 4, TanStack Query 5, react-hook-form + zod".
- **Before using any version-specific API, check the installed version in the manifest/lockfile** (and use the docs MCP if configured). Don't assume the latest or an older major.

## Repository layout

TODO(setup): Top-level folders, one line each, only where the purpose isn't obvious. Source: the repo tree. Example:
- `backend/` - API service (`app/api` routers, `app/services` business logic, `app/repositories` data access, `app/schemas` request/response models, `app/models` ORM models, `alembic/` migrations)
- `frontend/` - web app (`app/` routes, `components/` UI, `lib/api/generated/` client generated from the backend OpenAPI schema)

## Commands

Run from the repo root; commands use `--directory` / `--prefix` so they don't need `cd`.

| Task | Backend | Frontend |
|---|---|---|
| Install | TODO(setup): e.g. `uv sync --directory backend` | TODO(setup): e.g. `npm --prefix frontend ci` |
| Dev server | TODO(setup): e.g. `uv run --directory backend fastapi dev app/main.py` | TODO(setup): e.g. `npm --prefix frontend run dev` |
| All tests | TODO(setup): e.g. `uv run --directory backend pytest -q` | TODO(setup): e.g. `npm --prefix frontend run test` |
| Single test | TODO(setup): e.g. `uv run --directory backend pytest tests/api/test_orders.py::test_cancel -q` | TODO(setup): e.g. `npm --prefix frontend run test -- OrderCard` |
| Lint | TODO(setup): e.g. `uv run --directory backend ruff check .` | TODO(setup): e.g. `npm --prefix frontend run lint` |
| Format | TODO(setup): e.g. `uv run --directory backend ruff format .` | TODO(setup): e.g. `npm --prefix frontend run format` |
| Type check | TODO(setup): e.g. `uv run --directory backend mypy app` | TODO(setup): e.g. `npm --prefix frontend run typecheck` |
| E2E | n/a | TODO(setup): e.g. `npm --prefix frontend run test:e2e` |
| New migration | TODO(setup): e.g. `uv run --directory backend alembic revision --autogenerate -m "<msg>"` | n/a |
| Regenerate API client | n/a | TODO(setup): e.g. `npm --prefix frontend run generate:api` (needs the backend running) |

**Definition of done:** lint, type check and the relevant tests pass for every side you touched, the API client is regenerated if the backend contract changed, and you have shown the command output. Never claim success without evidence.

## Architecture rules

- Backend layering: router (HTTP only) -> service (business rules) -> repository (data access). Routers never contain business logic or queries.
- Request/response schemas are separate from ORM models; endpoints always declare their response model.
- The backend OpenAPI schema is the contract. Frontend types and API calls come from the generated client; never hand-write duplicate types.
- Frontend renders on the server by default; client-side code only where interactivity needs it.
- TODO(setup): Add 0-5 project-specific rules Claude can't infer from the code. Example: "All money is integer cents", "Tenancy: every query filters by organization_id".

## Workflow

- Small, clear change (diff describable in one sentence): do it, then verify.
- Multi-file or unclear change: explore, then plan (`/plan-feature` or plan mode), then implement task by task.
- Bugs: reproduce with a failing test first, fix the root cause, keep the test. Never silence errors or weaken tests.
- Iterate with single tests; run the full relevant suites before declaring done.
- Copy the pattern of the closest existing feature; name the file you followed.
- Stay in scope; mention unrelated problems instead of fixing them.

## Git conventions

| Branch prefix | Use for | Commit subject prefix |
|---|---|---|
| `feature/` | New functionality | `feature:` |
| `bugfix/` | Non-urgent bug fixes (normal release flow) | `bugfix:` |
| `hot-fix/` | Urgent production fixes | `hot-fix:` |
| `refactor/` | Behaviour-preserving restructuring | `refactor:` |
| `chore/` | Dependencies, tooling, config, CI | `chore:` |
| `docs/` | Documentation only | `docs:` |
| `test/` | Tests only | `test:` |
| `release/` | Release preparation | `release:` |

- Branch name: `<prefix><ticket-id>-<short-kebab-summary>`, e.g. `feature/PROJ-142-order-cancellation`, `hot-fix/PROJ-201-login-timeout`. Omit the ticket id if there is none.
- Commit: `<prefix> <imperative summary, max 72 chars>`, e.g. `feature: add order cancellation endpoint`. Body explains what and why. One logical change per commit.
- Integration branch: TODO(setup): e.g. `main`. Production branch: TODO(setup): e.g. `main` (or `production`). Source: `git branch -a`, CI deploy config, or ask the team.
- `hot-fix/` branches start from the **production** branch, contain the minimal fix plus a regression test, and after merging are merged back into the integration branch (`/hot-fix` does this flow).
- Never `--no-verify`, never force-push shared branches, always ask before pushing. No AI attribution anywhere.

## Delegation

- `searcher` (fast/cheap): any broad search for files, symbols or usages.
- `architect`: designs and plans for multi-file features.
- `debugger`: root-cause investigation. `test-writer`: tests.
- `code-reviewer`, `security-reviewer`, `verifier`: fresh-context checks before shipping.
- `ui-verifier`: checks UI changes in a real browser. `docs-writer`: docs and changelogs.

## Environment and secrets

- Config comes from environment variables; `.env` files are never read or edited by Claude. Document every variable in `.env.example`.
- Frontend: only variables prefixed `NEXT_PUBLIC_` reach the browser. Never put secrets in them.
- TODO(setup): Required local services and how to start them. Example: "Postgres via `docker compose up -d db`; API on :8000, web on :3000".

## Gotchas

TODO(setup): Non-obvious traps. Example: "Tests need `docker compose up -d db-test`", "The API client must be regenerated after any schema change or the frontend build fails". Write "None yet" if there are none, and add entries over time with `/learn`.

## Compaction

When compacting, keep: the current task and plan path, files changed so far, the commands in use, and any failing checks.
