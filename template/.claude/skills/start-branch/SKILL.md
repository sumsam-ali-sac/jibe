---
name: start-branch
description: Create a correctly named work branch (feature/, bugfix/, hot-fix/, refactor/, chore/, docs/, test/, release/) from the right base branch.
disable-model-invocation: true
argument-hint: "<type> [TICKET-ID] <short description>"
allowed-tools: Bash(git status *) Bash(git fetch *) Bash(git branch *) Bash(git switch *) Bash(git checkout -b *) Bash(git pull *)
---

Start a branch for: $ARGUMENTS

1. Parse the type: `feature`, `bugfix`, `hot-fix`, `refactor`, `chore`, `docs`, `test` or `release`. Accept common aliases (`feat` -> `feature`, `fix`/`bug` -> `bugfix`, `hotfix` -> `hot-fix`). If the type is missing or unclear, ask.
2. Build the name: `<type>/<TICKET-ID>-<short-kebab-summary>` (lowercase summary, max ~50 chars, no ticket id if none given). Example: `feature/PROJ-142-order-cancellation`.
3. Pick the base from "Git conventions" in CLAUDE.md:
   - `hot-fix/` -> the **production** branch.
   - `release/` -> the integration branch.
   - everything else -> the integration branch.
4. If there are uncommitted changes, stop and ask whether to commit, stash, or bring them along.
5. `git fetch`, update the base (`git switch <base> && git pull --ff-only`), then `git switch -c <name>`.
6. Report the branch name and base. For `hot-fix/`, remind: minimal change + regression test, then `/hot-fix` handles the rest.
