---
paths:
  - "**/app/**/*.{ts,tsx,js,jsx}"
  - "**/pages/**/*.{ts,tsx,js,jsx}"
  - "**/middleware.{ts,js}"
  - "**/next.config.*"
  - "**/lib/**/*.{ts,tsx,js,jsx}"
  - "**/actions/**/*.{ts,tsx,js,jsx}"
---

# Web app (routing, rendering, data)

**Versions first:** check the framework and UI-library versions in package.json before using version-specific APIs, and use the docs MCP when unsure. E.g. in Next.js 15+ `params`, `searchParams`, `cookies()` and `headers()` are async (await them) and `fetch` is not cached by default; older majors differ.

## Rendering
- Server Components by default. Add `"use client"` only to the smallest interactive leaf component, never to a layout or page just to use one hook.
- Props passed from server to client components must be serializable. Keep server-only code in modules that import `server-only`.
- No hydration mismatches: no `Date.now()`, random values, `window`/`localStorage` reads during render of server-rendered output.

## Data
- Fetch data on the server, close to where it's used; run independent requests in parallel (`Promise.all`); avoid request waterfalls.
- Be explicit about caching: set `cache`/`revalidate` or tags deliberately, and invalidate (`revalidatePath`/`revalidateTag`) after mutations.
- Client-side server state uses the project's data library (e.g. TanStack Query/SWR), never ad-hoc `useEffect` + `fetch`.
- All backend calls go through the generated API client / single fetch wrapper; base URL from env.

## Mutations
- Server Actions and route handlers are public endpoints: validate input with a schema, check auth and authorization inside them, return typed results and correct status codes.
- Show pending state and errors for every mutation.

## Routes
- Each meaningful segment has `loading`, `error` (client component) and, where relevant, `not-found` files.
- Set `metadata`/`generateMetadata` for every page (title, description, Open Graph where public).
- Use the framework's `Image` (with `sizes`), `Link` and font utilities.
- Middleware stays lightweight: auth redirects, headers. No heavy logic or DB calls.

## Config and secrets
- Only `NEXT_PUBLIC_*` env vars reach the browser; never put secrets there. Validate env at startup with a schema.
