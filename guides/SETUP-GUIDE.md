# Setup guide: installing Jibe and filling in every TODO

This takes 2 minutes with `/adapt-setup`, or about 20 minutes by hand. Either way, finish with the [checklist at the bottom](#7-verify-the-setup-works).

---

## 1. Install

**Requirements:** [Claude Code](https://code.claude.com), git, and **Node 20+** (the hooks are Node scripts so they run on every OS).

```bash
# macOS / Linux / Git Bash
bash install.sh /path/to/your-project
```

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Target C:\path\to\your-project
```

The installer:
- copies everything from `template/` into the project and **never overwrites** existing files;
- if the project already has a `CLAUDE.md` or `.claude/settings.json`, saves Jibe's version next to it as `CLAUDE.starter.md` / `.claude/settings.starter.json` for merging;
- appends `CLAUDE.local.md`, `.claude/settings.local.json` and `.claude/worktrees/` to `.gitignore`;
- warns if Node 20+ is missing.

Re-running it is safe. `--force` / `-Force` overwrites Jibe's files.

> **Trust the folder once.** Claude Code ignores a project's `permissions.allow` rules until you open the folder in an interactive session and accept the trust dialog. Hooks and deny rules still apply before that. Open the project interactively once before relying on the pre-approved commands, especially before using `claude -p` in scripts.

---

## 2. Option A: let Claude fill it in (recommended)

Open the project in Claude Code and run:

```
/adapt-setup
```

It merges any `.starter` copies, reads your manifests and CI config, fills every `TODO(setup)` marker, **runs the cheap commands to verify them**, tunes permissions, deletes rules for sides you don't have, adjusts hook patterns, and reports anything it couldn't determine. Review the diff afterwards; you know your project better than the manifests do.

---

## 3. Option B: fill it in by hand

Open `CLAUDE.md` and search for `TODO(setup)`. Replace each marker, **including its example text**, using the instructions below. Delete any row or section that doesn't apply rather than writing "n/a" everywhere. When none are left, delete the "SETUP" block at the top.

### 3.1 Title (`# TODO(setup): Project name`)
The product's name, e.g. `# Order Portal`.

### 3.2 Project summary
One or two sentences: what it does, for whom. Skip anything Claude can read from the code.
> Customer portal for managing orders and invoices; staff use the `/admin` area.

### 3.3 Stack and versions
Copy the **major.minor** versions from the lockfiles, not from memory. Claude uses these to choose version-specific APIs, so precision matters.

| Where to look | What to copy |
|---|---|
| `backend/pyproject.toml` / `uv.lock` | API framework, validation library, settings library, ORM, migration tool, DB driver |
| `docker-compose.yml` | Database and version |
| `frontend/package.json` | Framework + router style (App/Pages), UI library, styling, data-fetching and form libraries |

> - Backend: FastAPI 0.115, Pydantic 2.9, pydantic-settings 2.6, SQLAlchemy 2.0 (async, asyncpg), Alembic 1.14, PostgreSQL 16
> - Frontend: Next.js 15.1 (App Router), React 19, Tailwind 4, TanStack Query 5, react-hook-form 7 + zod 3

### 3.4 Repository layout
Only folders whose purpose isn't obvious from the name. One line each. Point at the generated API client folder: Claude must know never to edit it.

### 3.5 Commands table
The most valuable part of the file. Rules:
1. **Take commands from CI** (`.github/workflows/*.yml` etc.): that's what actually has to pass.
2. Write them so they **run from the repo root without `cd`**:

   | Layout | Backend form | Frontend form |
   |---|---|---|
   | `backend/` + `frontend/`, uv + npm | `uv run --directory backend pytest -q` | `npm --prefix frontend run test` |
   | pnpm | | `pnpm --dir frontend test` |
   | single app at root | `uv run pytest -q` | `npm run test` |

3. **Run each one** and fix the row if it fails.
4. Include the **single-test** form (Claude uses it constantly while iterating) and the **API-client generation** command if you generate types from the OpenAPI schema.
5. Add npm scripts if they're missing (e.g. `"typecheck": "tsc --noEmit"`), so the command is short and stable.

### 3.6 Architecture rules
Four generic rules are pre-filled. Add 0-5 project-specific rules that Claude **can't infer** and gets wrong without being told:
> - All money is stored as integer cents.
> - Every query is scoped by `organization_id` (multi-tenant).
> - Background jobs go through `app/worker`, never `BackgroundTasks`.

### 3.7 Git: integration and production branches
- **Integration branch:** where `feature/` and `bugfix/` PRs merge (`main` or `develop`).
- **Production branch:** what's deployed, and where `hot-fix/` branches start (often `main`; sometimes `production`/`release`).

Find them with `git branch -a`, your CI deploy trigger, or ask the team. If you only have `main`, both are `main`. See [GIT-WORKFLOW.md](GIT-WORKFLOW.md).

### 3.8 Environment and local services
How to get dependencies running locally:
> Postgres and Redis via `docker compose up -d db redis`; API on :8000, web on :3000; copy `.env.example` to `.env` in both apps.

### 3.9 Gotchas
Non-obvious traps that cost someone an hour:
> - Tests require `docker compose up -d db-test` (port 5433).
> - Regenerate the API client after any schema change or the frontend build fails.

Write "None yet" if there are none. Add more over time with `/learn`.

---

## 4. Tune the rest of `.claude/`

| What | Do this |
|---|---|
| `settings.json` -> `permissions.allow` | Keep only the example prefixes that match **your** commands; add your routine safe commands. Each rule must start exactly like the command (`Bash(npm --prefix frontend run test*)`). Never allow broad prefixes like `Bash(npm run *)`: that would also approve deploy scripts. |
| `rules/` | Delete files for sides you don't have. Edit `paths:` globs to your folder names. If your project deliberately differs from a rule, change the rule. |
| `hooks/protect-files.mjs` | Set the real generated-client folder; remove `dist/` if it holds source. |
| `hooks/block-dangerous.mjs` | Add your own dangerous scripts (deploy, reset-db); remove anything that blocks routine work. |
| `agents/` | Delete agents you won't use (fewer descriptions = less context). |
| `skills/` | Delete skills for sides you don't have (`new-page`, `new-component` for API-only repos, etc.). |

---

## 5. Optional: MCP servers

`.mcp.json.example` lists four servers. Copy the ones you want into `.mcp.json` (shared) or add them per-user with `claude mcp add ... --scope user`.

| Server | Why | Notes |
|---|---|---|
| `github` | Issues/PRs/reviews without leaving Claude | OAuth on first use, or a PAT header via an env var. Never commit tokens. The `gh` CLI covers most needs with less context. |
| `context7` | Current, version-specific library docs | Works without a key; a free key raises rate limits (header `CONTEXT7_API_KEY`). |
| `playwright` | Real-browser checks for `ui-verifier` | Needs Node 20+. Downloads browsers on first run. |
| `next-devtools` | Live build/runtime errors and routes from the dev server | Works best with recent framework versions. |

`@latest` always pulls the newest version. Pin a version (e.g. `@playwright/mcp@0.0.x`) if you need reproducibility.

---

## 6. Personal settings (not committed)

- `CLAUDE.local.md` (copy from `CLAUDE.local.md.example`): your sandbox URLs, local quirks.
- `.claude/settings.local.json` (copy from the example): extra permissions just for you.
- `~/.claude/CLAUDE.md`: rules for **all** your projects (e.g. "never add AI attribution").

---

## 7. Verify the setup works

Open a new Claude Code session in the project and check:

- [ ] The first message mentions the git snapshot (session-start hook ran), and no "TODO(setup)" reminder.
- [ ] `/context` (in a `claude` terminal) lists `CLAUDE.md` and the always-on rule.
- [ ] Ask: *"run `git clean -fd`"*. It must be **blocked** by `block-dangerous.mjs`.
- [ ] Ask: *"add a comment to .env"*. It must be **blocked** (permission deny or `protect-files.mjs`).
- [ ] Ask Claude to make a small edit to a source file. It gets formatted (if your formatter is installed).
- [ ] Type `/` and confirm Jibe's commands appear (`/ship`, `/new-endpoint`, ...).
- [ ] Ask: *"use the searcher agent to find where users are authenticated"*. The agent runs and returns `file:line` results.

Commit the setup: `/start-branch chore claude setup`, then `/commit`. The suggested message is `chore: add Claude Code project setup`.
