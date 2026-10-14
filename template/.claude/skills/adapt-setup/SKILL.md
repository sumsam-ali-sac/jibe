---
name: adapt-setup
description: Tailor Jibe (this Claude Code setup) to this repository - merge Jibe copies, fill every TODO(setup) marker in CLAUDE.md with verified facts, tune permissions, prune rules and hooks for the stack. Run once after installing Jibe, and again after big stack changes.
disable-model-invocation: true
argument-hint: "[extra notes about the project]"
---

Adapt Jibe (this Claude Code setup) to this project. Extra notes from the user: $ARGUMENTS

Work through every step and keep a list of what you did for the final report. Use the `searcher` subagent for broad exploration.

## 0. Merge kit copies (only if they exist)
The installer never overwrites. If the project already had these files, Jibe's versions were saved alongside:
- `CLAUDE.starter.md` -> add to the existing `CLAUDE.md` only the sections it lacks (Stack and versions, Commands, Definition of done, Architecture rules, Workflow, Git conventions, Delegation, Environment and secrets, Compaction). Keep the project's own content and wording. Delete `CLAUDE.starter.md`.
- `.claude/settings.starter.json` -> merge into `.claude/settings.json`: union `permissions.allow/ask/deny`, append `hooks` entries without duplicating, keep existing `attribution` unless absent. Confirm the JSON parses. Delete the starter file.

## 1. Discover the stack
- Backend manifest + lockfile (e.g. `backend/pyproject.toml`, `uv.lock`), frontend `package.json` + lockfile, `docker-compose*.yml`, `Makefile`/`justfile`, `.env.example`.
- **CI config is the source of truth for commands** (`.github/workflows/*`, `azure-pipelines.yml`, `.gitlab-ci.yml`).
- Layout: is it `backend/` + `frontend/`, a single app at the root, or something else? Note it; command forms depend on it.
- Package managers (uv/poetry/pip; npm/pnpm/yarn/bun), test runners, linters, type checkers, formatters, migration tool, API-client generator, E2E tool.
- Existing docs: README, CONTRIBUTING, any existing CLAUDE.md/AGENTS.md (merge, don't discard).
- Branches: `git branch -a`, default branch (`git symbolic-ref refs/remotes/origin/HEAD` or `gh repo view --json defaultBranchRef`), deploy config, to determine integration vs production branch.

## 2. Fill every TODO(setup) marker in CLAUDE.md
Each marker says what goes there, where to find it, and shows an example. For each:
- Replace the whole `TODO(setup): ...` text (including its example) with verified facts from the repo. Never leave the example text in.
- **Commands:** use forms that run from the repo root without `cd` (`uv run --directory backend ...`, `npm --prefix frontend ...`, `pnpm --dir frontend ...`), or root forms if the app is at the root. **Run the cheap ones** (lint, type check, a single test) to confirm they work; record failures.
- **Versions:** exact major.minor from the lockfile/manifest.
- **Branches:** if you can't determine integration/production branches with confidence, ask the user.
- If a row/section doesn't apply (e.g. no frontend, no E2E), delete it rather than writing "n/a" everywhere.
- If something can't be determined, ask the user. If they don't know, leave that single marker and list it in the report.
- Finally delete the "SETUP" block at the top, then search the file for `TODO(setup)` and confirm the count is zero (or list the leftovers).

## 3. Permissions (.claude/settings.json)
- `permissions.allow` ships with example command prefixes for common layouts. Keep only those matching the real commands, and add the project's real routine, non-destructive commands. **Each allow rule must start exactly like the command as written in CLAUDE.md** (rules match by prefix).
- Never allow broad prefixes like `Bash(npm run *)` or `Bash(uv run *)`. They would also approve deploy/publish scripts.
- Keep `ask` for push, PR creation/merge and applying migrations. Keep the `deny` rules for secrets.

## 4. Rules (.claude/rules/)
- Delete rule files for sides that don't exist (no frontend -> delete `frontend-*.md`, `testing-frontend.md`, `api-contract.md`; no backend -> delete `backend-*.md`, `testing-backend.md`, `api-contract.md`).
- Adjust `paths:` globs to the real folder names (e.g. `services/` vs `domain/`, `src/app/` vs `app/`).
- Check each rule against reality. If the project deliberately does something differently (e.g. a different data library), edit the rule to match the project, not the other way round.

## 5. Hooks (.claude/hooks/)
- Hooks need Node 20+ on PATH: confirm with `node --version`. If missing, tell the user prominently that the guard hooks won't run.
- `protect-files.mjs`: adjust generated-folder and lockfile patterns to this repo (e.g. the generated API client's real folder name; remove `dist/` if it holds real source).
- `block-dangerous.mjs`: remove patterns that would block legitimate routine commands here; add project-specific dangerous commands (deploy scripts, data-reset scripts).
- `format-on-edit.mjs`: confirm the project's formatter is one it detects (ruff/black in a venv or on PATH; biome/prettier in node_modules). If not, add a branch.

## 6. MCP (optional)
If `.mcp.json.example` exists, ask whether to enable any of its servers (GitHub, Context7 docs, Playwright browser, Next.js devtools). Copy the chosen entries into `.mcp.json`. Never put tokens in the file.

## 7. Report
- What you filled in and from which source.
- Commands verified (with pass/fail), and commands you couldn't verify.
- Remaining `TODO(setup)` markers (should be zero) and open questions.
- Files deleted/edited under `.claude/`.
- Suggest committing the setup on a `chore/claude-setup` branch with `chore: add Claude Code project setup`. Do not commit unless asked.
