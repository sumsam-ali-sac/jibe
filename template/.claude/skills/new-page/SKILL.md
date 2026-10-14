---
name: new-page
description: Add a web app route/page end to end - server-rendered page, loading/error/not-found states, metadata, data via the generated API client, interactive client leaves, tests, and browser verification.
disable-model-invocation: true
argument-hint: "<route path> <what the page does>"
---

New page: $ARGUMENTS

Follow `.claude/rules/frontend-app.md`, `frontend-components.md` and `testing-frontend.md`.

1. **Pattern:** find the most similar existing route (use `searcher`) and copy its structure: folder layout, layout usage, data loading, components, tests. Check framework versions in package.json first.
2. **Design the data flow:** what data is needed, from which endpoints (generated API client), fetched on the server; what's interactive (only those parts become client components); what mutations exist (server actions/route handlers with validation + auth). If an endpoint is missing, stop and suggest `/new-endpoint` first.
3. **Build:**
   - `page` as a server component; parallel data fetching; explicit caching/revalidation.
   - `loading`, `error`, and `not-found` (if the route has an id) files.
   - `metadata` / `generateMetadata`.
   - Reuse existing UI primitives; new components via `/new-component` conventions.
   - Auth/role protection consistent with existing protected routes.
4. **Tests:** component tests for interactive parts; an E2E test for the main journey if the project has E2E.
5. **Verify:** lint, type check and tests pass (show output). Then ask the `ui-verifier` subagent to check the page in the browser (desktop + mobile, states, console errors, keyboard access).
6. Report files, screenshots/findings, and suggest `/commit`.
