---
name: commit
description: Create clean commits from the current changes using the project's branch-type prefixes (feature, bugfix, hot-fix...), grouped into logical units, with no AI attribution.
disable-model-invocation: true
argument-hint: "[optional message hint]"
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git add *) Bash(git commit *) Bash(git branch *)
---

Commit the current work. Hint from the user: $ARGUMENTS

1. Inspect `git status`, `git diff`, `git diff --staged`, the current branch name and `git log --oneline -10`.
2. Group changes into logical units (e.g. a migration + model change separate from the UI that uses it). Never mix unrelated changes.
3. Never stage secrets, `.env` files, large binaries, build output, or unrelated files. If something looks accidental, ask.
4. Message format (see "Git conventions" in CLAUDE.md):
   ```
   <prefix> <imperative summary, max 72 chars>

   <body: what changed and why, wrapped at 72. Omit for trivial changes.>

   Refs: <TICKET-ID>          (if the branch name contains one)
   ```
   - `<prefix>` matches the branch type: `feature:`, `bugfix:`, `hot-fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `release:`. On `feature/...` a pure test-only commit may still use `test:`.
   - Take the ticket id from the branch name (`feature/PROJ-142-...` -> `Refs: PROJ-142`).
   - Mark breaking API/contract changes with a `BREAKING CHANGE: ...` line in the body.
5. No attribution of any kind: no `Co-Authored-By` for an AI, no "Generated with...", no tool or session mentions.
6. Never `--no-verify`. If a pre-commit hook fails, fix the cause and commit again. Never amend commits that were already pushed.
7. Show `git log --oneline` for the new commits. Do not push.
