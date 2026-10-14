# Workflow guide: shipping fast without losing quality

The day-to-day loop in a project with Jibe installed. The worked example uses the filled-in [fullstack-app CLAUDE.md](../examples/fullstack-app/CLAUDE.md): an API backend plus a server-rendered web frontend in one repo.

---

## The loop

```
/start-branch -> /spec -> /clear -> /plan-feature -> build task by task -> /ship -> /open-pr
                                                         ^                        |
                                                         +------ /learn <---------+   (whenever you correct Claude)
```

| # | Step | You type | What happens |
|---|---|---|---|
| 1 | Branch | `/start-branch feature PROJ-142 order cancellation` | `feature/PROJ-142-order-cancellation` from the integration branch |
| 2 | Specify | `/spec order cancellation` | Claude interviews you and writes `docs/specs/order-cancellation.md` |
| 3 | Reset | `/clear` | Fresh context for implementation |
| 4 | Plan | `/plan-feature docs/specs/order-cancellation.md` | `architect` (Opus) designs; the plan goes to `docs/plans/` |
| 5 | Build | `/db-migration ...`, `/new-endpoint ...`, `/new-page ...`, or "execute task 3" | Test first -> code -> verify -> commit per task. Each edited file is auto-formatted |
| 6 | Ship | `/ship docs/plans/order-cancellation.md` | Checks on both sides + client regeneration + 3-4 reviewers in parallel; fixes; commits |
| 7 | PR | `/open-pr` | Push (after you confirm) and a PR with What/Why/How/API changes/Testing |
| * | Learn | `/learn regenerate the API client before running the frontend type check` | The lesson lands in CLAUDE.md, a rule, a skill or a hook |

**Small change?** Skip 2-4: ask for it directly, with how to verify it.
**Bug?** `/fix-issue 123` (`bugfix/` flow). **Production on fire?** `/hot-fix <problem>`.

---

## Worked example: "customers can cancel orders"

### 1. Branch and spec
```
/start-branch feature PROJ-142 order cancellation
/spec order cancellation
```
Claude looks at `backend/app/services/orders.py` and `frontend/app/orders/[id]/page.tsx` through the `searcher` agent, then asks only the hard questions:
- Which statuses can be cancelled? -> **`pending` and `paid` only.**
- Refund? -> **Yes if paid, exactly once, via the payments service.**
- Who? -> **The owner or an admin; others get 404, so the order's existence doesn't leak.**
- UI? -> **A "Cancel order" button with a confirm dialog; the status badge updates without a full reload.**

Output: `docs/specs/order-cancellation.md` with 8 numbered acceptance criteria and an end-to-end check.

### 2. `/clear`, then `/plan-feature docs/specs/order-cancellation.md`
```
- [ ] 1. OrderStatus.CANCELLED + cancelled_at column, reviewed migration     verify: uv run --directory backend pytest tests/models -q
- [ ] 2. OrderService.cancel(): status rules, owner/admin check              verify: uv run --directory backend pytest tests/services/test_orders.py -q
- [ ] 3. Idempotent refund on paid orders                                    verify: same
- [ ] 4. POST /api/v1/orders/{id}/cancel -> 200 OrderRead; 404/409 mapping   verify: uv run --directory backend pytest tests/api/test_orders.py -q
- [ ] 5. Regenerate API client                                               verify: npm --prefix frontend run typecheck
- [ ] 6. CancelOrderButton (client leaf) + confirm dialog, server action     verify: npm --prefix frontend run test -- CancelOrderButton
- [ ] 7. Wire into order page, revalidate after mutation                     verify: npm --prefix frontend run test:e2e -- cancel
```
Fixing a plan line takes seconds. Fixing a 600-line diff takes far longer.

### 3. Build
- Task 1: `/db-migration add cancelled status and cancelled_at to orders`. Claude notices autogenerate missed the enum value, fixes the migration, and tests upgrade and downgrade.
- Task 4: `/new-endpoint POST /api/v1/orders/{id}/cancel cancel an order`:
  ```python
  async def test_cancel_other_users_order_returns_404(client, other_user_order, auth_headers):
      r = await client.post(f"/api/v1/orders/{other_user_order.id}/cancel", headers=auth_headers)
      assert r.status_code == 404
  ```
  The test fails, Claude implements the change, and the test passes. The router stays thin and the rules live in the service.
- Task 6: `/new-component CancelOrderButton confirm and cancel an order`. Only the button is a client component; the page stays server-rendered.
- Each task is committed: `feature: add order cancel endpoint` with `Refs: PROJ-142`.

### 4. `/ship docs/plans/order-cancellation.md`
- Backend and frontend lint, type check and tests are green, and the client is regenerated.
- In parallel:
  - `security-reviewer`: *"[high] orders/actions.ts:12 - server action doesn't re-check the session, so it's callable directly."* Claude fixes it and adds a test.
  - `code-reviewer`: *"[major] page.tsx:40 - no revalidation after cancel, so the stale status shows."* Claude fixes it.
  - `verifier`: 8/8 criteria covered, verdict READY.
  - `ui-verifier`: desktop and mobile pass, the dialog is keyboard-accessible, and the console is clean.

### 5. `/open-pr`
Claude shows the title `feature: order cancellation [PROJ-142]` and the body, you confirm, and it pushes and creates the PR. Everything is authored by you; nothing mentions AI.

---

## Habits that compound

1. **`/clear` between unrelated tasks.** After two failed corrections, `/clear` and re-prompt with what you learned.
2. **Always give a check:** a test, a command, or a screenshot. "Run X and show me the output" turns a guess into proof.
3. **Point at examples:** "follow `app/api/routes/invoices.py`" beats a paragraph of description.
4. **Contract first:** design request and response schemas before UI, and regenerate the client every time they change.
5. **Delegate reading:** "use subagents to investigate how auth refresh works" keeps your context clean.
6. **Writer/reviewer split:** reviews run in fresh contexts (`/ship`), so they aren't biased by the code's author.
7. **Rewind, don't argue:** `Esc Esc` or `/rewind` back to before a bad attempt.
8. **Every correction becomes `/learn`.** The setup gets better every week.
9. **Keep CLAUDE.md lean:** if Claude already does it right without a line, delete the line. If it must happen every time, make it a hook.
