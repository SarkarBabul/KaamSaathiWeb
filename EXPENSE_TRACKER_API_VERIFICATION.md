# Expense Tracker — API Contract Verification (Phase 3D)

> **Status:** Source audit + read-only live verification. No source code was modified to produce this document.
> **Source of truth:** `D:\Projects\KaamsaathiPC` — specifically the **legacy** `src/app/features/dashboard/employer/expense-tracker/**` tree (the real, API-driven implementation), **not** `src/app/features/enterprise-user/pages/expense-tracker/**` (fully mocked — see §1). Corroborated against `D:\Projects\kaamflutter`'s independent `expense_tracker_repository.dart`.
> **Method:** Direct read of Angular component/service/type source, direct read of the Flutter repository, and read-only live network capture (Chrome DevTools MCP) against an already-authenticated React desktop session. No create/update/delete mutation was executed.

---

## 1. Two Angular Expense Tracker surfaces — only one is real

| Surface | Route | Services/HTTP calls | State |
|---|---|---|---|
| `enterprise-user/pages/expense-tracker/expense-tracker.ts` | `/enterprise/expense-tracker` (`ENTERPRISE` role) | **None — no service injected, zero HTTP calls anywhere in the file.** | 100% mocked: 4 static stat cards, 2 hardcoded ApexCharts (`monthlyExpenseChart`, `categoryBreakdownChart`), a 6-row hardcoded `expenseLedger` array. Confirmed by direct read — not inferred. |
| `dashboard/employer/expense-tracker/expense-tracker.component.ts` | `/dashboard/employer/expense-tracker` (`admin` role, `RoleGuard`) | `ExpenseTrackerService` (`core/services/expense-tracker.service.ts`), `MasterDataService.getSites()` | **Real** — 6 live API endpoints, a full add/edit/delete transaction flow with a complex multi-state form (expense vs. income, qty×unitPrice auto-total, payment type/mode, advance handling). This is the implementation React was migrated from. |

**Finding:** the real implementation's Angular route is gated to role `admin`, not `ENTERPRISE` — the role that the React `/enterprise/expense-tracker` route (and this session's live test account) actually uses. Angular's client-side `RoleGuard` would never let an `ENTERPRISE` user reach this page in the Angular app at all. The backend itself does **not** appear to enforce that same restriction — see §4, all reads succeeded with `role: ENTERPRISE`, scoped only by `leaderId` ownership, not by role. This is a genuine cross-role backend behavior worth flagging, not assumed.

---

## 2. Source-derived API contract (`ExpenseTrackerService`, `api.service.ts`)

| # | Endpoint | Method | Target host | Query/body | Mutating? |
|---|---|---|---|---|---|
| 1 | `/v2/dashboard` | GET | `default` (GET's flag is always a no-op — `api.service.ts:35-37`, both branches identical) | `{ leaderId }` | Read-only |
| 2 | `/v2/transactions` | GET | `default` | `{ leaderId }` | Read-only |
| 3 | `/v2/categories` | GET | `default` | `{ type: "INCOME" \| "EXPENSE" }` | Read-only |
| 4 | `/v2/transactions/income` or `/v2/transactions/expense` | POST | `default` (no flag arg passed → real POST-flag switch takes its `false` branch) | `multipart/form-data` — see §3 | **Mutating (create)** |
| 5 | `/v2/transactions/update/{type}/{id}` | POST | `default` | `multipart/form-data` | **Mutating (update)** |
| 6 | `/v2/transactions/{id}` | DELETE | `default` (DELETE has no flag parameter at all — always `apiBaseUrl`) | none | **Mutating (delete)** |

Unlike Site Management, **there is no create/edit host split here** — all six calls resolve to the same `default` host, confirmed directly from `api.service.ts`'s real branching logic, not assumed by convention.

`leaderId`/`parentId` source: `TokenService.getParentId()`, same value as the user's own `userId` — identical pattern to every other migrated feature.

---

## 3. Create/update payload — exact field names (source-derived, NOT live-verified)

Built as `FormData` in `expense-tracker.component.ts`'s `saveTransaction()`, plus `leaderId` appended by the service:

**Common:** `transactionDate`, `categoryId`, `amount`, `partyName`, `siteId`, `description`, `leaderId`.
**Expense only:** `paymentType` (`FULL_PAID`/`PARTIAL`/`UNPAID`), `paymentMode` (`CASH`/`UPI`/`BANK`), `paidAmount`, `qty`, `unitPrice`.
**Income only:** `paymentType` forced to `FULL_PAID`, `paymentMode`, `advanceFlag` (`true`/`false`), and either `advanceAmount` (if the selected category is named exactly `"Advance Received"`) or `paidAmount` (otherwise) — both carrying the full `amount`.
**Update adds:** the target transaction's `id` in the URL path, not the body.

**A real, confirmed quirk not reproduced:** the live component ends `saveTransaction()` with a second pass — `Object.entries(transactionform.value).forEach(([key, value]) => formData.set(key, String(value)))` — that re-flattens every raw reactive-form control (including the untouched `paidAmount: [0]` default) back onto the already-computed `FormData`. If a user never clicks a payment-type button, this silently overwrites a correctly-computed "full paid" `paidAmount` back down to `0`. This is a genuine bug in the live source, not a contract requirement. The React port computes the field the UI visibly *intends* for each payment type instead of reproducing this default-path bug — flagged here per the project's standing practice of documenting such decisions rather than silently choosing either way.

---

## 4. Read-only live verification (this session)

Captured via Chrome DevTools MCP against an already-authenticated React dev session (`localhost:8081`, role `ENTERPRISE`, `leaderId 1787`), by navigating to the newly-implemented `/enterprise/expense-tracker` page and opening (not submitting) its Add-transaction dialog. No credential value, token, or header value is reproduced below.

| Request | Host | Status | Response shape |
|---|---|---|---|
| `GET /v2/dashboard?leaderId=1787` | `api.kametgroup.com` (default) | **200** | `{ totalReceived, totalSpent, availableBalance, totalDue, advanceGiven, advanceUsed, advanceRemaining }` — raw object, **no envelope wrapper** (`status`/`data`), matching Angular's `Observable<AmountResponse>` typing exactly. `advanceUsed`/`advanceRemaining` were `null` on this account (matches why Angular's own template comments those two cards out — see §5). |
| `GET /v2/transactions?leaderId=1787` | `api.kametgroup.com` (default) | **200** | `[]` — raw array, no envelope, matching `Observable<Transaction[]>`. Account has zero transactions today. |
| `GET /v2/getAllSites?userId=1787` | `api.kametgroup.com` (default) | **200** | Same shape already verified in Phase 3C — reused unchanged via `useSites()`. |
| `GET /v2/categories?type=EXPENSE` | `api.kametgroup.com` (default) | **200** | `[{ id, name, type }]` × 15 real expense categories (Cement, Iron/Steel, Sand, …). |
| `GET /v2/categories?type=INCOME` | `api.kametgroup.com` (default) | **200** | `[{ id, name, type }]` × 6 real income categories — **confirmed `"Advance Received"` (id 2) genuinely exists**, validating the advance-detection logic is meaningful against real data, not a dead code path. |

**No unexpected 401/403/404/500 occurred.** The page rendered correctly (5 stat cards, empty-state transaction list, working dialog with live category/site data), stayed on `/enterprise/expense-tracker` throughout, and the session (`accessToken` in `localStorage`) remained present after every call — no auto-logout was triggered.

**Create/Update/Delete mutations were NOT executed** — no explicit authorization was given for this phase, and (separately, see §6) the create/update endpoints could not have been correctly exercised yet regardless, due to an `httpClient.ts` gap.

---

## 5. Angular UI vs. component: dead code not ported

The live `expense-tracker.component.html` template only renders **5** of the 7 summary values the component computes (`Treceived`, `Tspent`, `Tbalance`, `Tdue`, `TadvanceGiven`) — the `Advance Used` and `Advance Remaining` cards are present in the `.ts` signals but HTML-commented out of the real template (lines 107-139), so they are correctly **not real UI** in Angular today. The React port renders only the same 5 live cards, not the 2 dead ones — verified directly against the template, not assumed from the component alone.

Similarly, roughly 250 lines of the Angular income-form template (payment-type/advance UI for income) are HTML-commented dead code — never rendered. The React port's income form matches only what Angular's live template actually shows (date, received-from, income type, site, total amount, payment mode, description) — the advance/partial behavior for income still applies automatically via category selection (matching Angular's real, live behavior), just without a dedicated UI section that Angular itself never shipped.

---

## 6. Flutter cross-check — endpoints agree, payload SHAPE diverges

`D:\Projects\kaamflutter\lib\screens\admin_screens\expense_tracker\repository\expense_tracker_repository.dart` was read directly.

**Agreement (strong corroboration):** identical endpoints, methods, and query params for all 6 calls — `/v2/dashboard`, `/v2/transactions`, `/v2/categories`, `/v2/transactions/{income|expense}`, `/v2/transactions/update/{type}/{id}`, `/v2/transactions/{id}` DELETE. Same `leaderId` sourcing pattern, same `multipart/form-data` transport for create/update.

**Documented divergence (not silently reconciled):** Flutter's create/update payload represents categories as an **array of line items** — `"items": jsonEncode([{ categoryId, customCategory?, quantity, unitPrice, unitId }, ...])` — supporting multiple categories/quantities/units per transaction, plus a `/v2/units` endpoint Angular's employer component never calls at all. Angular's real implementation instead sends **one flat `categoryId`/`qty`/`unitPrice` directly on the transaction**, with no `items` array and no unit concept. This looks like Flutter reflects a newer/richer backend contract than the one Angular's real page actually implements. Per this task's explicit instruction and Angular being the designated primary source of truth, **the React port follows Angular's flat-field contract, not Flutter's items-array contract** — this divergence is recorded here rather than guessed at or merged.

---

## 7. Mutation endpoints — found, and intentionally not tested

All three (`addTransaction`, `updateTransaction`, `deleteTransaction`) exist and were traced from source (§2/§3). None were executed. Two blockers, both explicit:

1. **This phase's own instruction** — no create/update/delete without your explicit authorization *and* a legitimate cleanup path.
2. **A separate, newly-found technical blocker** — see §8 below. `addTransaction`/`updateTransaction` require a `multipart/form-data` body; `deleteTransaction` does not (plain DELETE, no body) and is not affected by §8, but was still not executed absent explicit authorization.

**Cleanup path exists for this feature, unlike Site Management:** `DELETE /v2/transactions/{id}` is a real, working endpoint (confirmed in both Angular and Flutter source) — so a future authorized create→verify→delete test is possible here once §8 is resolved, in a way Site Management's create test never had available.

---

## 8. Blocker found: `httpClient.ts` has no FormData/multipart support

`src/app-desktop/api/httpClient.ts`'s `request()` unconditionally does:
```ts
if (hasBody) headers.set("Content-Type", "application/json");
...
body: hasBody ? JSON.stringify(options?.body) : undefined,
```
for every non-GET call. Passing a real `FormData` object here would be JSON-stringified (producing a meaningless `"{}"`-shaped body) and sent with the wrong `Content-Type` — silently breaking the multipart upload the real backend expects for `addTransaction`/`updateTransaction`.

**Not fixed in this phase** — `httpClient.ts` is shared by every already-verified feature (Login, Dashboard, Attendance, Payments, User Management, Site Management), and this task's instructions treat it as protected infrastructure. The two mutation functions are fully defined and ready (`expenseTracker.api.ts`), but calling them today would send a malformed request. **This needs an explicit, additive (backward-compatible) change to `httpClient.ts` — detect a `FormData` instance and skip both the `JSON.stringify` and the manual `Content-Type` header (letting the browser set its own multipart boundary) — before any live create/update mutation test can be attempted.** Flagged for your decision rather than made silently.

---

## 9. Summary classification

| Item | Classification |
|---|---|
| `GET /v2/dashboard`, `/v2/transactions`, `/v2/categories` | **LIVE VERIFIED** (this session, §4) |
| `GET /v2/getAllSites` (reused) | **LIVE VERIFIED** (Phase 3C) |
| `POST /v2/transactions/{income\|expense}`, `POST /v2/transactions/update/{type}/{id}` | **SOURCE-DERIVED, NOT LIVE VERIFIED** — additionally blocked by the `httpClient.ts` FormData gap (§8) |
| `DELETE /v2/transactions/{id}` | **SOURCE-DERIVED, NOT LIVE VERIFIED** — not blocked technically, just not executed (no authorization sought this phase) |
| Enterprise-user's own Expense Tracker page/charts | **MOCKED / NOT A REAL REFERENCE** — confirmed via direct source read (§1), not used as a basis for anything in this port |
| Advance Used / Advance Remaining cards | **DEAD CODE IN ANGULAR ITSELF** — correctly not ported (§5) |
