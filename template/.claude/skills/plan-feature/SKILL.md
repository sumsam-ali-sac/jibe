---
name: plan-feature
description: Turn a spec or feature request into a small-step implementation plan saved to docs/plans/. Use before implementing multi-file changes.
disable-model-invocation: true
argument-hint: "<spec path or feature description>"
---

Plan the implementation for: $ARGUMENTS

1. If a spec path was given, read it. Otherwise restate the goal and acceptance criteria and confirm with the user if anything is ambiguous.
2. Delegate design to the `architect` subagent, giving it the spec/goal. Ask it for options only if there is a real trade-off.
3. Review its plan yourself: every task small (one commit), independently verifiable, test-first, ordered so the code is always green. Add the exact verify command per task.
4. Save to `docs/plans/<kebab-name>.md` with a checkbox per task:

```markdown
# Plan: <name>
Spec: <path or "inline">

## Approach
## Tasks
- [ ] 1. <title> - files: ... - test: ... - verify: `<command>`
- [ ] 2. ...
## End-to-end verification
## Risks
```

5. Present the plan and wait for approval. Do not start coding. Suggest executing it task by task (each task: failing test, implement, verify, commit) and running `/ship` at the end.
