---
name: fix-issue
description: Fix a (non-urgent) issue end to end on a bugfix/ branch - read it, reproduce with a failing test, fix the root cause, verify, commit. For urgent production problems use /hot-fix instead.
disable-model-invocation: true
argument-hint: "<issue number, URL or description>"
---

Fix issue: $ARGUMENTS

1. Read it: if it's a GitHub issue number/URL, `gh issue view <n> --comments`. Restate expected vs actual behaviour in two lines.
2. If on the integration branch, create `bugfix/<TICKET-ID>-<slug>` (`/start-branch bugfix ...`).
3. Locate the code with the `searcher` subagent. For a non-obvious cause, delegate to the `debugger` subagent.
4. Reproduce: write a test that fails for exactly this bug (API test, component test or E2E, whichever is closest to the symptom). Run it and show the failure.
5. Fix the root cause with the smallest correct change. No unrelated refactors.
6. If the fix changes a backend schema/endpoint: regenerate the API client and fix frontend types.
7. Verify: the new test passes; related test files, lint and type check pass for every side touched. Show the output.
8. Commit with `/commit` rules: `bugfix: <summary>`, body with root cause, `Refs: <ticket>` / `Closes #<n>`.
9. Summarize root cause and fix; ask whether to open a PR (`/open-pr`).
