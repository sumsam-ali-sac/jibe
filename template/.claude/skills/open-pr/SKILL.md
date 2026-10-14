---
name: open-pr
description: Push the current branch and open a pull request with a reviewer-friendly description, using the gh CLI. Targets the integration branch, or the production branch for hot-fix/ branches.
disable-model-invocation: true
argument-hint: "[base branch] [extra context]"
---

Open a PR for the current branch. Arguments: $ARGUMENTS

1. Confirm: not on the integration/production branch, working tree clean, checks passed recently (if unsure, run them).
2. Base branch: the argument if given; else production branch for `hot-fix/*`, otherwise the integration branch (both from "Git conventions" in CLAUDE.md).
3. Read `git log <base>..HEAD`, `git diff <base>...HEAD --stat`, and any spec/plan in `docs/`.
4. Draft:
   - **Title:** `<prefix> <summary>` matching the branch type (e.g. `feature: order cancellation`), plus the ticket id if present: `feature: order cancellation [PROJ-142]`.
   - **Body:**
     ```markdown
     ## What
     ## Why
     ## How (notable decisions and trade-offs)
     ## API / data changes (endpoints, schemas, migrations; breaking?)
     ## Screenshots (UI changes: before/after)
     ## Testing (commands run and results; manual steps)
     ## Risks and rollback
     Refs: PROJ-142 / Closes #123
     ```
     Delete sections that don't apply. No AI attribution, tool mentions or session links.
5. Show the title and body; ask for confirmation. Then `git push -u origin HEAD` and `gh pr create --base <base> --title "..." --body-file <tempfile>`.
6. Return the PR URL and run `gh pr checks` once if CI exists.
