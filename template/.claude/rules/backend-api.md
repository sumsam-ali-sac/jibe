---
paths:
  - "**/*.py"
---

# Backend API rules

**Versions first:** check the installed framework and validation-library versions (backend manifest/lockfile) before using version-specific APIs (e.g. Pydantic v2 uses `model_dump()`, `model_validate()`, `field_validator`, `ConfigDict`; v1 differs).

## Structure
- Routers (`APIRouter`, one per resource) only translate HTTP <-> service calls. Business rules live in services; queries live in repositories.
- Services don't import framework request/response objects, so they stay testable without HTTP.
- Register routers in one place with a version prefix (e.g. `/api/v1`) and `tags`.

## Endpoints
- Every endpoint declares `response_model` (or a precise return annotation), an explicit `status_code` (201 create, 204 delete), and `summary`. Document non-2xx responses via `responses=`.
- Use the `Annotated[..., Depends(...)]` style and shared aliases (e.g. `SessionDep`, `CurrentUser`) instead of repeating `Depends` everywhere.
- Path/query params use `Path`/`Query` constraints (ge/le/max_length). List endpoints paginate with a capped `limit`.
- Separate schemas per direction: `XCreate`, `XUpdate` (all optional for PATCH), `XRead`/`XPublic`. Never return ORM objects or internal fields (password hashes, internal ids/flags) directly.

## Async correctness (the most common bug)
- Inside `async def` never call blocking I/O: sync HTTP clients, sync DB drivers, `time.sleep`, large file reads, CPU-heavy work. Use async libraries, or make the endpoint plain `def` (runs in the threadpool), or `run_in_threadpool`.
- Create shared clients (HTTP client, DB engine) once in the app `lifespan` and inject them; don't create them per request. Use `lifespan`, not deprecated startup/shutdown events.

## Errors
- Services raise domain exceptions; exception handlers map them to HTTP status codes and one consistent error body. Use `HTTPException` only at the router edge.
- Never leak stack traces, SQL or internal messages to clients. Let validation errors stay 422.

## Security
- Auth via a dependency (e.g. `get_current_user`); check authorization per resource (owner/role/tenant) in the service, never only by trusting ids from the client (IDOR).
- CORS: explicit origins from settings; never `*` together with credentials.
- Settings: one `BaseSettings` class (pydantic-settings), loaded once and injected; no scattered `os.getenv`.

## Other
- Short fire-and-forget work may use `BackgroundTasks`; anything that must not be lost goes to a task queue.
- Structured logging with request id; no `print`.
- Code must pass the project's linter and type checker with no new ignores.
