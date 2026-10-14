---
name: hot-fix
description: Urgent production fix flow - branch from the production branch, reproduce with a failing test, minimal fix, verify, PR to production, then merge back into the integration branch.
disable-model-invocation: true
argument-hint: "<issue/ticket or description of the production problem>"
---

Production problem: $ARGUMENTS

Speed matters, but so does not making it worse. Keep the change minimal.

1. **Branch:** read the production and integration branches from "Git conventions" in CLAUDE.md. Create `hot-fix/<TICKET-ID>-<slug>` from the up-to-date production branch (`/start-branch hot-fix ...`). Stop if there are uncommitted changes.
2. **Understand:** restate expected vs actual in two lines. If the cause isn't obvious, delegate to the `debugger` subagent with the error/logs.
3. **Reproduce:** write a test that fails because of this bug. Run it and show the failure.
4. **Fix:** the smallest correct change at the root cause. No refactors, no dependency upgrades, no unrelated cleanups. If a migration is required, call that out explicitly to the user before continuing.
5. **Verify:** the new test passes; the full test suite for the affected side passes; lint and type check pass. Show the output. Run `code-reviewer` (and `security-reviewer` if auth/data/input is involved) on the diff.
6. **Commit:** `hot-fix: <summary>` with `Refs: <TICKET-ID>`, following `/commit` rules.
7. **PR:** ask, then push and open a PR **into the production branch** (`/open-pr <production-branch>`), titled `hot-fix: ...`, including impact, root cause, fix, verification, and rollback plan.
8. **After merge (tell the user, don't do it unasked):** merge or cherry-pick the fix into the integration branch so it isn't lost on the next release, and tag/release a patch version per the team's process.
