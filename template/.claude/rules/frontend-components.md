---
paths:
  - "**/*.{tsx,jsx}"
---

# UI components

## Design
- Use existing primitives/design-system components first (check `components/ui` or the project equivalent). Follow the project's styling approach and design tokens; no inline-style sprawl or one-off colors.
- Function components with typed props; explicit unions for variants (`variant: "primary" | "secondary"`). Follow the project's export and file-naming conventions.
- Components are pure: no side effects during render. Split when a component does data loading *and* complex UI.

## State
- Colocate state with the component that uses it; lift only when siblings need it.
- Don't store derived values in state; compute them during render.
- Server data lives in the data library cache, not in global client stores. Global stores are for genuinely global UI state.

## Effects and hooks
- `useEffect` is only for syncing with external systems (subscriptions, browser APIs, non-React widgets). Not for transforming data, reacting to events, or fetching.
- Complete dependency arrays; never disable the hooks lint rule to silence it, fix the cause.
- Don't add `useMemo`/`useCallback`/`memo` by default; only for a measured problem or a stable-identity requirement (and not at all if the project uses the React Compiler).
- List keys are stable ids, never array indexes for dynamic lists.

## Forms
- Use the project's form library with schema validation; share the schema with the server where possible. Show field-level errors and disable double submits.

## Accessibility (required, not optional)
- Semantic elements (`button` for actions, `a`/`Link` for navigation), labels for every input, `alt` text, visible focus, full keyboard operation. ARIA only when no native element fits.
- Every async view handles loading, empty and error states.
