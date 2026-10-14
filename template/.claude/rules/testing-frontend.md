---
paths:
  - "**/*.{test,spec}.{ts,tsx,js,jsx}"
  - "**/__tests__/**"
  - "**/e2e/**"
  - "**/tests/**/*.{ts,tsx,js,jsx}"
  - "**/{vitest,jest,playwright}.config.*"
---

# Frontend tests

## Component and unit tests
- Use the project's runner (Vitest/Jest) with Testing Library. Test what the user sees and does.
- Query by role and accessible name (`getByRole('button', { name: /save/i })`), then label/text; `data-testid` only as a last resort.
- Use `userEvent` over `fireEvent`; await `findBy*`/`waitFor` for async UI; no arbitrary timeouts.
- Don't assert on implementation details (internal state, hook calls, class names). Avoid large snapshots.
- Mock the network at the boundary (e.g. MSW handlers), not by mocking internal modules.
- Pure logic (formatters, reducers, validation schemas) gets plain unit tests.
- Async Server Components are covered by testing their extracted logic plus E2E tests.

## End-to-end (Playwright)
- Cover critical user journeys (sign in, main create/edit flows, checkout), not every permutation.
- Stable locators: role/label/text first; tests independent; seed data through the API, not the UI.
- Use Playwright's auto-waiting assertions (`await expect(...)`), never fixed sleeps.

Visual or layout changes: verify in a real browser (the `ui-verifier` agent or Playwright MCP) instead of assuming.
