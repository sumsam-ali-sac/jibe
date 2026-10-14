---
paths:
  - "**/tests/**/*.py"
  - "**/test_*.py"
  - "**/*_test.py"
  - "**/conftest.py"
---

# Backend tests

- Use the project's test runner and its configured async plugin (check config for anyio vs pytest-asyncio mode) rather than mixing styles.
- API tests go through the HTTP layer: an async HTTP client bound to the app (e.g. `httpx.AsyncClient` with `ASGITransport`) or the framework's `TestClient`.
- Replace dependencies with `app.dependency_overrides` (DB session, current user, external clients) and clear overrides after each test (fixture teardown).
- Database: an isolated test database or a transaction rolled back per test. Never touch dev/prod data.
- Data via factories/fixtures in `conftest.py`, not copy-pasted setup.
- For each endpoint cover: success, validation (422), unauthenticated (401), forbidden/other user's resource (403/404), not found (404), conflict (409) where relevant, pagination bounds.
- Mock outbound HTTP at the transport level (e.g. respx); tests never hit the network.
- No sleeps or real clocks: freeze or inject time.
- Every bug fix adds a regression test that failed before the fix.
