---
paths:
  - "**/schemas/**/*.py"
  - "**/schemas.py"
  - "**/api/**/*.py"
  - "**/routers/**/*.py"
  - "**/openapi*.json"
  - "**/lib/api/**"
  - "**/services/api/**"
---

# Backend <-> frontend contract

- The backend OpenAPI schema is the single source of truth. Frontend types and API functions are **generated** from it (command in CLAUDE.md). Never hand-write duplicate request/response types; never hand-edit generated files.
- Any change to a backend schema or endpoint: regenerate the client, fix resulting frontend type errors, and include both in the same change.
- Prefer additive changes. Removing or renaming a field or endpoint is a breaking change: deprecate first, or version the route.
- One JSON naming convention across the API (configure an alias generator if backend fields are snake_case but the API is camelCase); don't mix.
- One error response shape, handled in one place on the frontend.
- Dates/times as ISO-8601 in UTC; money as integer minor units or decimal strings, never floats.
- Give endpoints stable `operation_id`s / names so generated function names don't churn.
