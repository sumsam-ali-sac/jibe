---
name: ship
description: Pre-merge quality gate - run all checks for every side touched, sync the API contract, run parallel code/security/spec review in fresh contexts, fix real issues, verify, then commit. Use when a feature or fix is finished.
disable-model-invocation: true
argument-hint: "[spec or plan path]"
---

Get the current work ready to merge. Spec/plan (optional): $ARGUMENTS

## 1. Checks
- Determine which sides changed (`git diff <integration-branch>...HEAD --stat` plus uncommitted changes).
- For each side touched, run the lint (with autofix), format, type check and full test commands from CLAUDE.md. Fix failures at the root cause; re-run until green. Keep the final output.
- Backend schema/endpoint changed -> regenerate the API client and run the frontend type check.
- Models changed -> confirm a reviewed migration exists (see `/db-migration`).

## 2. Independent review (in parallel, fresh contexts)
Launch in the same message, each on the branch diff:
- `code-reviewer`
- `security-reviewer` (skip only for docs/tests-only diffs)
- `verifier` (only if a spec or plan path was given)
- `ui-verifier` (only if UI changed and the dev server is running; otherwise list it as a manual step)

## 3. Triage
- Fix every critical/major/high finding; re-run affected checks.
- Minor findings: fix if trivial, otherwise list them for the user.
- If you disagree with a finding, say why with evidence instead of silently ignoring it.

## 4. Commit
Follow `/commit` rules: prefix matching the branch type, one logical change per commit, no AI attribution, never `--no-verify`.

## 5. Report
- Checks: commands and pass/fail.
- Review findings: fixed / deferred (with reason).
- Commits created.
- Ask whether to push and open a PR (`/open-pr`). Never push without a yes.
