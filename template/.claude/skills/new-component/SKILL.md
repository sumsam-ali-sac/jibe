---
name: new-component
description: Build a reusable UI component that fits the design system - typed props, variants, accessibility, loading/empty/error states, and tests.
disable-model-invocation: true
argument-hint: "<ComponentName> <what it does>"
---

New component: $ARGUMENTS

Follow `.claude/rules/frontend-components.md` and `testing-frontend.md`.

1. **Reuse check:** search existing components and UI primitives (use `searcher`). If something close exists, extend or compose it instead and say so.
2. **API design:** props with precise types, variants as string unions, sensible defaults, `children`/slots where composition fits, forwarding of native attributes/ref if the project's primitives do. Keep it presentational; data fetching stays in the page or a container.
3. **Server or client:** keep it a server component unless it needs state, effects, event handlers or browser APIs.
4. **Build:** project styling approach and design tokens only; semantic HTML; keyboard support and visible focus; labels/ARIA where needed; loading/empty/error variants if it shows async data.
5. **Tests:** render + interaction tests querying by role/label; include a keyboard interaction and an error/empty state. Add a story if the project uses Storybook.
6. **Verify:** lint, type check, tests (show output). For visual components, ask `ui-verifier` to check it in context.
7. Report the component API (props table) and usage example.
