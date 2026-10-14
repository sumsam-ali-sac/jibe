---
name: spec
description: Interview the user about a feature and write a self-contained spec to docs/specs/. Use before building anything non-trivial.
disable-model-invocation: true
argument-hint: "<short feature description>"
---

Feature to specify: $ARGUMENTS

1. Briefly study the relevant code (use the `searcher` subagent) so your questions are informed.
2. Interview the user with the AskUserQuestion tool, a few questions at a time. Skip obvious questions; dig into: scope boundaries, edge cases, failure modes, data/model changes, permissions, UX, performance, migration/backward compatibility, how we'll know it works.
3. Keep going until there are no material unknowns. Then write `docs/specs/<kebab-name>.md`:

```markdown
# <Feature name>

## Goal
## Non-goals
## Users and scenarios
## Behaviour (rules, states, edge cases)
## Interfaces (API/CLI/UI, data model changes)
## Files likely involved
## Risks and open questions
## Acceptance criteria (numbered, testable)
## End-to-end verification (exact steps/commands that prove it works)
```

4. Show the user the path and a 5-line summary. Suggest next: `/plan-feature docs/specs/<kebab-name>.md` in a fresh session (`/clear`).
