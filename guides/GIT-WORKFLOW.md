# Git workflow

Jibe's skills (`/start-branch`, `/commit`, `/fix-issue`, `/hot-fix`, `/open-pr`) all follow this one table.

## Branch types

| Branch prefix | Use for | Starts from | Merges into | Commit subject prefix |
|---|---|---|---|---|
| `feature/` | New functionality | integration | integration | `feature:` |
| `bugfix/` | Non-urgent bug fixes | integration | integration | `bugfix:` |
| `hot-fix/` | Urgent production fixes | **production** | **production**, then back into integration | `hot-fix:` |
| `refactor/` | Behaviour-preserving restructuring | integration | integration | `refactor:` |
| `chore/` | Dependencies, tooling, config, CI | integration | integration | `chore:` |
| `docs/` | Documentation only | integration | integration | `docs:` |
| `test/` | Tests only | integration | integration | `test:` |
| `release/` | Release preparation (version bump, changelog) | integration | production (and back into integration) | `release:` |

*Integration* and *production* branches are set in each project's CLAUDE.md. With a single `main`, both are `main`.

## Naming

```
<prefix><TICKET-ID>-<short-kebab-summary>

feature/PROJ-142-order-cancellation
bugfix/PROJ-188-pagination-off-by-one
hot-fix/PROJ-201-login-timeout
chore/upgrade-framework-15
```

Lowercase summary, about 50 characters at most, and no ticket id if there isn't one. `/start-branch feature PROJ-142 order cancellation` builds this for you.

## Commit messages

```
feature: add order cancellation endpoint

Owners can cancel pending or paid orders. Paid orders are refunded
once through the payments service; a second cancel returns 409.

Refs: PROJ-142
```

- Subject: `<prefix> <imperative summary>`, max 72 characters, no trailing period.
- The prefix matches the branch type. A test-only commit on a feature branch may use `test:`.
- Body: what and why (not how). Use `BREAKING CHANGE: ...` for contract breaks.
- One logical change per commit. Never `--no-verify`. **No AI attribution of any kind.**

> These prefixes intentionally differ from Conventional Commits (`feat:`, `fix:`). If you use commitlint or semantic-release, configure their allowed types to `feature, bugfix, hot-fix, refactor, chore, docs, test, release`.

## Hot-fix flow (`/hot-fix`)

```
production  --*------------------*(merge PR)----*(tag vX.Y.Z+1)
               \                /
hot-fix/...     *--test--fix---*
                                \
integration ---------------------*(merge back / cherry-pick)
```

1. Branch `hot-fix/...` from the **up-to-date production branch**.
2. Write a failing regression test, then the **minimal** fix. No refactors and no dependency bumps.
3. Run the full checks for the affected side, then get a fresh-context review.
4. PR into **production**, with impact, root cause, verification and rollback plan.
5. After merge: **merge the fix back into integration** (or cherry-pick it), so the next release doesn't reintroduce the bug. Tag a patch release according to your process.

## Pull requests (`/open-pr`)

- Title: `<prefix> <summary> [TICKET]`, e.g. `feature: order cancellation [PROJ-142]`.
- Body sections: What, Why, How, API/data changes, Screenshots (UI), Testing, Risks and rollback.
- Small PRs (under ~400 changed lines) merge faster and get better reviews. Split large features into stacked tasks from the plan.
- Claude always asks before `git push` and before creating or merging PRs (`ask` rules in `settings.json`).
