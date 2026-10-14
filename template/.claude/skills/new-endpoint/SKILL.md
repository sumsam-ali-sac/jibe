---
name: new-endpoint
description: Add a backend API endpoint end to end - schemas, repository, service, router, migration if needed, API tests, and regenerated frontend client - following the project's existing patterns.
disable-model-invocation: true
argument-hint: "<METHOD /path> <what it does>"
---

New endpoint: $ARGUMENTS

Follow `.claude/rules/backend-api.md`, `backend-data.md`, `api-contract.md` and `testing-backend.md`.

1. **Pattern:** find the most similar existing endpoint (use `searcher`) and copy its structure across router, service, repository, schemas and tests. Name the files you're following.
2. **Contract first:** define request/response schemas (`XCreate`/`XUpdate`/`XRead`), status codes, errors, auth requirement, pagination. If anything is ambiguous (who may call it? what on conflict?), ask before coding.
3. **Data:** if the model changes, do it via `/db-migration` (model + reviewed migration).
4. **Tests first:** API tests through the HTTP client for success, 422, 401, 403/404 (other user's resource), 404, 409 as relevant. Run them and see them fail.
5. **Implement:** repository query -> service with business rules and authorization -> thin router with `response_model`, `status_code`, `summary`, `tags`, documented error responses. Register the router if new.
6. **Verify:** endpoint tests, the backend suite, lint and type check pass. Show the output.
7. **Contract sync:** if a frontend exists, regenerate the API client (command in CLAUDE.md) and run the frontend type check.
8. Report files changed and suggest `/commit`.
