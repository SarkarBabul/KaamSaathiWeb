# User Management — Angular → React Migration Audit (Phase 3)

> **Status:** Read-only analysis. No application source files were modified to produce this document.
> **Method:** Direct inspection of the Angular source at `D:\Projects\KaamsaathiPC` (routes, guards, services, components, `.html` templates — not just `.ts` logic) plus the existing React implementation and `MIGRATION_TO_REACT.md`. Where this document's findings differ from `MIGRATION_TO_REACT.md`, **this document is correct** — several real discrepancies were only visible in the actual `.html` templates (commented-out UI), which the original blueprint did not fully capture. Every such conflict is called out explicitly below.
> **`DESKTOP_REACT_ARCHITECTURE.md` was requested as required reading but does not exist in the repository** — not found at `D:\Projects\KaamSaathiWeb\DESKTOP_REACT_ARCHITECTURE.md` or anywhere else in the project. This audit proceeds without it; flagged as `UNKNOWN — REQUIRES VERIFICATION` (confirm with the team whether this file was meant to exist).

---

## 1. The Real User Management Route

```
app.routes.ts:
  'enterprise'  canActivate:[AuthGuard]  data:{roles:['ENTERPRISE']}
                loadChildren → enterprise-user.routes.ts

enterprise-user.routes.ts:
  '' component: Home  canActivate:[RoleGuard]  data:{roles:['ENTERPRISE']}
    'user-management'  component: UserManagementComponent   ← THE live route
```

- **Exact path:** `/enterprise/user-management`
- **Component:** `UserManagementComponent`, class exported from `src/app/features/enterprise-user/pages/user-management/user-management.ts` (co-located `.html`/`.scss`, no lazy `loadComponent` — it's eagerly imported at the top of `enterprise-user.routes.ts` along with the other 8 enterprise pages, confirmed).
- **Guards:** `AuthGuard` (outer, `/enterprise`, checks only "is logged in" — the `roles` array it receives is silently unused, a confirmed pre-existing bug, see §8) → `RoleGuard` (inner, `''` parent route inside `enterprise-user.routes.ts`, `data:{roles:['ENTERPRISE']}`, actually enforces the role).
- **This is the ACTIVE/LIVE route** for the ENTERPRISE-role desktop surface this migration targets. It is real, not a stub — matches `MIGRATION_TO_REACT.md`.

### Alternative/legacy route (different role, NOT in scope, but shares backend logic)

```
app.routes.ts:
  'dashboard'  canActivate:[AuthGuard]
               loadChildren → dashboard.routes.ts

dashboard.routes.ts:
  'employer'  canActivate:[RoleGuard]  data:{roles:['admin']}
    'employee-management'  loadComponent → employer/employee-management/employee-management.component (EmployeeManagement)
```

- **Path:** `/dashboard/employer/employee-management`, gated for role `admin` (a different login role than `ENTERPRISE` — a different account type entirely, not reachable by the same user session as `/enterprise/*`).
- **Component:** `EmployeeManagement` — a thin shell (`selectedTabIndex` only) composing two Material-table child components: `AddEmployee` and `ListEmployee` (plus a `MatDialog`-based `EditElist` for editing).
- **This route is LIVE for `admin`-role users, but is architecturally irrelevant to the `/enterprise/*` surface being migrated.** It is documented here **only** because — critically — it calls the **exact same `EmployeeManagementService`** as the enterprise page, and its real, fuller behavior is directly relevant to deciding what Phase 3 should build. See §2, §5, §7, §18.
- No other User-Management-shaped route exists anywhere in the Angular app (super-admin dashboard has its own unrelated `user-table` component for platform-wide user analytics — confirmed out of scope, not employee/subordinate management).

**Verdict:** One active route for this migration (`/enterprise/user-management` → `UserManagementComponent`). One legacy-but-live alternative (`/dashboard/employer/employee-management`) that shares the same backend service and is the richer implementation for several sub-behaviors (see below). No dead/unused User Management routes were found.

---

## 2. Every User Management Implementation Found

| File | Role | Status |
|---|---|---|
| `features/enterprise-user/pages/user-management/user-management.ts` (+`.html`,`.scss`,`.spec.ts`) | `UserManagementComponent` — the live enterprise page | **Real, reachable, in scope** |
| `features/dashboard/employer/employee-management/employee-management.component.ts` (+`.html`,`.scss`) | `EmployeeManagement` — legacy shell | Real, reachable, **different role, out of scope as a route**, but see below |
| `.../employee-management/component/add-employee/add-employee.component.ts` (+`.html`,`.scss`) | `AddEmployee` — legacy create form | Real, reachable via the legacy route; **materially richer than the enterprise create form** |
| `.../employee-management/component/list-employee/list-employee.component.ts` (+`.html`,`.scss`) | `ListEmployee` — legacy Material table | Real, reachable via the legacy route; **has working, reachable Edit + Delete buttons** (enterprise's are not — see §7) |
| `.../employee-management/component/edit-elist/edit-elist.component.ts` (+`.html`,`.scss`) | `EditElist` — legacy edit dialog (`MatDialog`) | Real, reachable via the legacy route; richer field set than enterprise's edit |
| `core/services/employee-management.service.ts` | `EmployeeManagementService` | **The single shared service used by BOTH trees** — `getEmployees`, `addEmployee`, `editSubordinate`, `deleteEmployee`, `getAssignStatus`, `uploadExcel` |
| `core/services/master-data.service.ts` | `MasterDataService` | Shared lookup service — `getRoles()`, `getSites()` |
| `core/services/api.service.ts` | `ApiService` | Shared low-level HTTP wrapper — see §3 |
| `core/services/token.service.ts` | `TokenService` | Provides `getParentId()`/`getUserId()`/`getRole()` used to build request payloads |
| `core/guards/auth.guard.ts`, `role.guard.ts` | Guards | See §8 |

No separate "User Management module", no additional standalone components, no pipes specific to this feature, and no dedicated models file — the `User` interface is declared inline in each `.ts` file that needs it (and differs slightly between them — see §11).

**There is exactly one backend service (`EmployeeManagementService`) behind both UIs.** This is unlike Expense Tracker/Reports/AI Dashboard (where the enterprise page is 100% mocked with zero service calls) — **the enterprise User Management page is genuinely wired to real, working endpoints today.** The legacy tree is not "the real implementation vs. a mock" here; it's "a more complete UI over the identical service," with some conflicting call patterns (see §3, §15).

---

## 3. Every API Endpoint — Traced From `ApiService`, Not Inferred

**How `ApiService` resolves a target (re-confirmed by direct source read, `core/services/api.service.ts`):**
```ts
get<T>(url, params?, headers?, flag=false)     → ALWAYS `${apiBaseUrl}${url}` — flag has literally no effect (both branches of its ternary are the same expression)
post<T>(url, body?, params?, headers?, flag=false) → flag ? enterpriseapiBaseUrl : apiBaseUrl  — the real switch
put<T>(url, body, params?, headers?, flag=false)   → same switch as post
delete<T>(url, params?, headers?)              → no flag parameter at all — always apiBaseUrl
postBlob(url, body?, params?, headers?)        → no flag parameter at all — always apiBaseUrl
```
`apiBaseUrl = 'https://api.kametgroup.com/api'`, `enterpriseapiBaseUrl = 'http://43.204.170.108:9091/api'` (from `environments/environment.ts`, confirmed unchanged from Phase 0/2 audits). `authInterceptor` only attaches `authKey` + `Authorization: Bearer <token>` headers — confirmed it never rewrites the URL or target (re-verified, same as the Phase 2 investigation).

### 3.1 `EmployeeManagementService` (`core/services/employee-management.service.ts`)

| Method | HTTP | Path | Flag passed by caller | Target — **VERIFIED FROM SOURCE** |
|---|---|---|---|---|
| `getEmployees(isEnterprise=false)` | POST | `/v2/getSubordinate` | Enterprise page: `getEmployees()` — **no arg** → `false` | **default** |
| `addEmployee(payload, isEnterprise=false)` | POST | `/v2/addSubordinate` | Enterprise page: `addEmployee(payload, true)` — **explicit `true`** | **enterprise** |
| | | | Legacy `AddEmployee`: `addEmployee(payload)` — **no arg** → `false` | **default** ⚠ same endpoint, different target depending on caller — see §15 |
| `editSubordinate(payload, isEnterprise=false)` | POST | `/v2/editSubordinate` | Enterprise page: `editSubordinate(payload, true)` — **explicit `true`** | **enterprise** |
| | | | Legacy `EditElist`: `editSubordinate(payload)` — **no arg** → `false` | **default** ⚠ same conflict |
| `deleteEmployee(empId, isEnterprise=false)` | POST | `/v2/authenticate/permanentDeleteSubordinate` | Enterprise page: `deleteEmployee(user.id)` — **no arg** → `false` (method exists but its UI trigger is commented out, see §7) | **default** |
| | | | Legacy `ListEmployee`: `deleteEmployee(empId)` — no arg → `false` | **default** (consistent here) |
| `getAssignStatus()` | GET | `/v2/{parentId}/assignment-status` | Not called anywhere in the enterprise page. Called by legacy `AddEmployee.submit()` before every create, to enforce a plan worker-limit. | **default** (GET always ignores the flag regardless) |
| `uploadExcel(file)` | POST (multipart `FormData`) | `/v2/upload-excel` | Not called anywhere in the enterprise page. Called by legacy `AddEmployee.onExcelUpload()`. No flag passed. | **default** |

Request body shapes (verified from source, not inferred):
- `getEmployees`: `{ parentId: <TokenService.getParentId()> }`
- `addEmployee` (enterprise caller): `{ name, role, mobileNumber, siteId: Number(site_id), parentUserId: <parentId> }` — `parentUserId` is added by the service itself, not the caller.
- `addEmployee` (**legacy caller — different shape, same endpoint**): `{ name, role: String(roleId), site_id: Number(siteId), isGeneratedMobile, mobileNumber?, rate?, parentName?, panNumber?, aadharNumber?, parentUserId }` — note **`site_id` (snake_case)**, not `siteId`. See §15 for why this matters.
- `editSubordinate` (enterprise caller): `{ name, role, mobileNumber, siteId: Number(site_id), userId: editingUserId }`
- `editSubordinate` (**legacy caller — different shape**): `{ id, name, mobileNumber, aadharNumber, site_id, role: String(role), rate, parentName, panNumber }` — again **`site_id`** snake_case, plus `id` instead of `userId`.
- `deleteEmployee`: `{ id: empId }`
- `uploadExcel`: `FormData` with `file` and `leaderId` (=`parentId`).

### 3.2 `MasterDataService` (`core/services/master-data.service.ts`)

| Method | HTTP | Path | Flag | Target — VERIFIED |
|---|---|---|---|---|
| `getSites(isEnterprise=false)` | GET | `/v2/getAllSites?userId={parentId}` | Enterprise page calls `getSites()` — no arg. Irrelevant anyway: **GET always ignores the flag** (confirmed at the `ApiService.get` source line — both ternary branches are identical). | **default**, always, regardless of caller |
| `getRoles()` | POST | `/v2/getAllRoles` | No flag param exists on this method at all; internally calls `api.post('/v2/getAllRoles')` with no flag → `false` | **default** |

**Response envelopes (verified):**
- `getEmployees` → `{ status: 'SUCCESS', subordinates: [...] }` — **not** `{data: [...]}**. Confirmed directly in both the enterprise (`res.status === 'SUCCESS' && res.subordinates`) and legacy (`res.status === 'SUCCESS' && res.subordinates`) callers — consistent between both trees.
- `addEmployee` / `editSubordinate` / `deleteEmployee` — success path only checks that the Observable resolved (no field-level check on the response body at all in either tree); errors are caught via the Observable's `error` callback.
- `getSites` → `{ data: [...] }` (confirmed, matches Phase 2's `Site` handling already built in React).
- `getRoles` → `{ data: [...] }` of `{ id, roleName }` objects (confirmed field names from legacy `AddEmployee`'s typed signal `roles = signal<Array<{id: string; roleName: string}>>`).
- `getAssignStatus` → `{ data: { withinLimit: boolean, workerLimit: number, assignedCount: number, ... } }` — exact full field set **UNKNOWN — REQUIRES VERIFICATION** (only `withinLimit`, `workerLimit`, `assignedCount` are read by the one caller that exists).
- No pagination fields exist in any of these envelopes. No error-response shape was found beyond the generic Angular `HttpErrorResponse` — every caller's `error` handler ignores the body and just shows a generic `alert()`.

**All targets above are marked VERIFIED FROM SOURCE — none are inferred from URL naming**, per the explicit instruction. Nothing in this feature area is `UNKNOWN` for target selection; the only genuine unknown is the exact `getAssignStatus` response schema.

---

## 4. User List Behavior (Enterprise Page — the live implementation)

- **Load trigger:** `ngOnInit()` calls `getEmployees()` (list) and `fetchSites()` (site lookups for the Add/Edit form only — **not** for a list filter, see below) unconditionally on mount. No refresh button, no polling.
- **Loading state:** `loadingUsers` signal, initial value `true`; table shows a single `colspan` row reading "Loading users..." while true.
- **Response transform:** `if (res.status === 'SUCCESS' && res.subordinates) { this.users = res.subordinates } else { this.users = [] }` — a direct assignment, **no client-side flattening/grouping** (unlike Attendance/Payments). The raw `subordinates` array elements are used as-is.
- **Displayed columns (confirmed from `.html`, in exact order):** User (name, with the numeric `id` shown as small secondary text underneath), Mobile, Role (as a badge span), Assigned site (rendered as a non-navigating styled `<a>`), Actions.
  - ⚠ **A "Status" column exists in the `.ts`/is fully coded but its `<td>` is HTML-commented-out** — it is **not rendered** in the live app today. See §7.
- **Sorting:** None. No sortable columns, no sort UI, no sort state anywhere in the component.
- **Pagination:** **None.** Full result set is rendered every time; no page-size control, no server or client pagination of any kind. `MIGRATION_TO_REACT.md`'s general statement ("no server-side pagination or sorting anywhere in this feature area") is confirmed correct here too.
- **Search:** One live, working, uncommented text input (`searchText`, two-way bound) with placeholder "Search by name, mobile or site." `filteredUsers` getter matches (case-insensitive, substring) against `name`, `mobileNumber`, and `siteName`. **No debounce** — filters on every keystroke via Angular's synchronous getter re-evaluation (no explicit `debounceTime`/RxJS operator anywhere).
- **Role filter: coded but NOT live.** `selectedRole`, `uniqueRoles`, `toggleRoleDropdown()`, `selectRole()` all exist and are exercised by `filteredUsers`'s `matchesRole` check — **but the entire dropdown block in the `.html` is wrapped in an Angular template comment** (`<!-- ... -->`, lines 30–46 of `user-management.html`). **This is a discrepancy from `MIGRATION_TO_REACT.md`**, which described the role filter as a live, present feature. It is not reachable in the running app. `selectedRole` therefore always stays at its default `'All roles'`, meaning `matchesRole` is always `true` in practice.
- **Site filtering, manager/supervisor filtering, worker filtering:** **None exist anywhere in this component** — not coded, not commented-out, not present in any form. Do not add these; they are not an Angular capability being migrated, they would be invented.
- **Active/inactive filtering:** Not present (consistent with the Status column also being non-live).
- **Reset behavior:** No explicit "clear filters" control exists (the search box has no clear button either) — a user clears it by manually deleting the text.
- **Empty state:** `@empty` block on the `@for` loop — literal text **"User does not match!"** (typo preserved intentionally; reproduce verbatim per your team's parity-vs-fix judgment, flagged here rather than silently corrected).
- **Error state:** On `getEmployees()` error, `this.users = []` and `loadingUsers` set false — **no visible error message or banner is rendered anywhere**; the failure is silent from the user's perspective (only a `console.error`). This is a real UX gap in Angular, not a migration gap — decide whether to improve on it in React (recommended) or reproduce the silence for parity.
- **Retry:** No retry button/mechanism exists.

---

## 5. Create User — Complete Trace (Enterprise Page)

- **Trigger:** "Add user" button (`btn-primary`, top-right of the card header) → `openAddUserModal()` → sets `showAddUserModal = true`.
- **UI:** An in-page modal overlay (`*ngIf`-style `@if (showAddUserModal)` block in the same template) — **not a separate route, not Angular Material** (no `MatDialog` in this tree; contrast with the legacy tree's `MatDialog`-based `EditElist`).
- **Form:** Angular Reactive Forms, `FormGroup addUserForm`, built in the constructor:

| Field | Control name | Type | Required | Pattern/other rule | Notes |
|---|---|---|---|---|---|
| Full name | `name` | text | ✅ `Validators.required` | — | |
| Mobile number | `mobileNumber` | text, `maxlength="10"` (template attribute, not a Validator) | ✅ | `Validators.pattern(/^[6-9]\d{9}$/)` | Exact same pattern as login/other forms |
| Role | `role` | `<select>` | ✅ `Validators.required` | — | **Only ONE hardcoded `<option>` exists: `value="supervisor"` labeled "Supervisor".** No roles API call backs this dropdown (`MasterDataService.getRoles()` is never injected into this component). Confirmed by direct template read — this is not a rendering issue, there is genuinely only one selectable role in the live UI today. |
| Assigned site | `site_id` | `<select>` | ✅ `Validators.required` | — | Populated from the real `sites` signal (`MasterDataService.getSites()`, see §9), using `site.siteId` as the option value and `site.siteName` as the label |

- No email field, no password field (per the header text "Login credentials are auto-generated"), no worker-specific fields (no Aadhar/PAN/daily-wage/parent-name/gender — those exist **only** in the legacy `AddEmployee` form, see §5.1), no conditional fields, no conditional validation.
- **Submit handler:** `submitAddUser()`. If `addUserForm.invalid`, calls `markAllAsTouched()` and returns (surfaces the inline `error-text` spans already in the template) — no toast for validation failure.
- **Payload sent:** `{ name, role, mobileNumber, siteId: Number(site_id) }` — service adds `parentUserId` (from `TokenService.getParentId()`).
- **Endpoint / target:** `POST /v2/addSubordinate`, **target = enterprise** (explicit `true` passed — VERIFIED, §3).
- **Success:** `alert('Employee added successfully')` (native browser dialog — not a toast/snackbar), `addUserForm.reset()`, `getEmployees()` (full list refetch — no optimistic update), `closeAddUserModal()`.
- **Error:** `alert('Failed to add employee')` — no detail from the actual error surfaced to the user.
- **Dialog close:** `closeAddUserModal()` resets the form, clears `isEditMode`/`editingUserId` — used both by Cancel and by the header's ✕ button, and by successful submission.

### 5.1 The richer legacy `AddEmployee` (for context — not the route being migrated, but see §18 for whether to port its extra capability)

Confirmed richer, real, reachable (via `/dashboard/employer/employee-management`) create flow with:
- Real `MasterDataService.getRoles()`-backed role dropdown (not a hardcoded single option).
- A **plan/worker-limit enforcement step**: before submitting, calls `getAssignStatus()`; if `!withinLimit`, shows a "plan limit reached" modal instead of submitting.
- Additional real fields: `isGeneratedMobile` (checkbox — when checked, disables/clears the phone field so the backend auto-generates a mobile number instead), `dailyWage`/`rate` (optional numeric), `aadharNumber` (optional, `Validators.pattern(/^[2-9][0-9]{11}$/)` + `maxLength(12)`), `pancard`/`panNumber` (optional, PAN regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`), `parentname`/`parentName` (optional, F/H name).
- **Sends a different payload shape to the same endpoint** — `site_id` (snake_case) instead of `siteId`, `role: String(roleId)` from a real roles list instead of a hardcoded string, plus the extra optional fields when present. See §15 (HIGH risk) for why this matters before choosing a payload shape.
- Also wires real Excel bulk-upload (`uploadExcel`) — a file input that isn't present in the enterprise tree at all (the enterprise page's "Bulk import" button has **no click handler**, confirmed dead/decorative, see §7).

---

## 6. Edit User — Complete Trace (Enterprise Page)

- **Trigger:** "Edit" item in each row's `⋮` dropdown menu → `editUser(user, event)`.
- **No separate fetch-by-id call** — the row's already-loaded `user` object is used directly to `patchValue()` the same `addUserForm` used for create:
  ```ts
  addUserForm.patchValue({ name: user.name, mobileNumber: user.mobileNumber, role: user.roleName, site_id: user.siteId });
  ```
  ⚠ **Confirmed fragility, not a guess:** the role `<select>` has exactly one option with `value="supervisor"` (lowercase). `patchValue` sets the control to `user.roleName`, which per the `User` interface/table rendering is a display-cased string (e.g., likely `"Supervisor"` capitalized, based on how it's rendered as a badge). If `roleName` from the API is not the exact literal string `"supervisor"` (lowercase), the `<select>` will show **no option selected** even though a value is technically set on the control — this is a real, live, pre-existing Angular bug (not something to silently fix without a product decision — see §15).
- Then `isEditMode = true`, `editingUserId = user.id`, `showAddUserModal = true` — reuses the exact same modal/form as create, distinguished only by `isEditMode`.
- **Fields editable:** name, mobileNumber, role, site_id — the same four as create, no more, no less. No fields are read-only-but-shown (e.g. no display of `active` status, created-date, etc. in this modal).
- **Submit (same `submitAddUser()` as create):** when `isEditMode && editingUserId !== null`, builds `{ ...payload, userId: editingUserId }` and calls `editSubordinate(EditPayload, true)`.
- **Endpoint / target:** `POST /v2/editSubordinate`, **target = enterprise** (explicit `true` — VERIFIED).
- **Success:** `alert('Employee updated successfully')`, form reset, `getEmployees()` refetch, modal closed, `isEditMode`/`editingUserId` cleared.
- **Error:** `alert('Failed to update employee')`.
- **Create vs. update payload diff:** identical base shape (`name, role, mobileNumber, siteId`) plus `userId` only on update. Both use the **enterprise** target (unlike the legacy tree, where both use **default** — see §15).

---

## 7. Delete / Deactivate / Activate — What Angular ACTUALLY Supports (Live, Not Just Coded)

This is the section where the actual `.html` source materially changes the picture from `MIGRATION_TO_REACT.md`.

| Action | Method exists in `.ts`? | Real API wired? | **Live in the rendered UI?** | Confirmed detail |
|---|---|---|---|---|
| Delete (enterprise) | ✅ `deleteUser(user, event)` | ✅ calls `deleteEmployee(user.id)` (real, `target=default`) | ❌ **NOT LIVE** — the `<div class="menu-item danger" (click)="deleteUser(...)">Delete</div>` block in `user-management.html` is **HTML-commented-out**. Only "Edit" appears in the live dropdown menu. | No confirmation dialog exists in this tree either way (it would never be reached) |
| Delete (legacy) | ✅ `deleteEmployee(empId)` on `ListEmployee` | ✅ same service, `target=default` | ✅ **LIVE** — real "Delete" icon button, wired, in `list-employee.component.html` | Uses a **native `confirm('Are you sure you want to delete this employee?')`** before calling the API — this exact wording is the only real confirmation-dialog copy that exists anywhere in the codebase for this action |
| Status toggle (active/inactive) | ✅ `toggleStatus(user)` flips `user.active` between `1`/`0` | ❌ **No API call at all** — confirmed local-only, `MIGRATION_TO_REACT.md` was correct about this part | ❌ **NOT LIVE** — the entire `<td>` containing the checkbox/switch and status text is HTML-commented-out in `user-management.html` | Not reachable even as a cosmetic toggle in the running app today |
| Activate / Deactivate / Block / Unblock / Enable / Disable | — | — | Not found anywhere | No such concept exists beyond the dead `toggleStatus` above |
| Bulk import | Button exists | `uploadExcel()` exists on the shared service | ❌ **NOT LIVE on the enterprise page** — the "Bulk import" `<button>` in `user-management.html` has **no `(click)` binding at all** | Real and live only on the **legacy** `AddEmployee` component (a file input wired to `onExcelUpload()`) |

**Conclusion for Phase 3 scope:** As the enterprise page stands today, **there is no reachable delete, status-change, or bulk-import action** — only List, Create, and Edit are live end-to-end. Per your instruction *"Do not implement any action that exists only as a visual button with no real Angular behavior"* — strictly, Delete/Status/Bulk-import buttons **do not even exist as visual buttons** in the live enterprise UI (they're commented out, not just inert), so building React equivalents for them would be adding functionality beyond what's live, not porting a mocked/broken one. Given the underlying API and confirmation-copy for Delete are proven real and working (just disconnected from this particular UI), this is flagged in §18 as a **recommendation-with-confidence** rather than something silently included or silently excluded — it needs your explicit go/no-go before Phase 3 implementation.

---

## 8. Roles and Authorization

- **Roles relevant to this feature:** the coarse account role (`ENTERPRISE`, `admin`, `super_admin`, generic/default) gates *route access*, exactly as established and already correctly fixed in the React Phase 0 `ProtectedRoute`/`RoleRoute`. Re-confirmed byte-for-byte against current Angular source: `AuthGuard` still only checks `route.data['role']` (singular — the `roles` array passed at `/enterprise` is still silently ignored, exactly as before); `RoleGuard` still lowercases `userRole` before a `switch` that includes a dead `case 'ENTERPRISE':` (uppercase literal, can never match after lowercasing). **No change since Phase 0 — the already-corrected React `ProtectedRoute`/`RoleRoute` architecture remains fully valid and should be reused as-is for this feature; do not reproduce these two bugs.**
- **Which roles can access `/enterprise/user-management`:** `ENTERPRISE` only (via the inner `RoleGuard`).
- **Which roles can create/edit/delete users:** No additional, finer-grained permission check exists anywhere in `UserManagementComponent` or `EmployeeManagementService` — **any authenticated `ENTERPRISE` user who reaches the page can perform every action the UI exposes.** There is no concept of "read-only enterprise user" or per-action permission flags in the frontend.
- **Backend enforcement:** Cannot be confirmed from the frontend source. `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` whether the backend independently re-checks permissions on `addSubordinate`/`editSubordinate`/`permanentDeleteSubordinate`, or trusts the frontend/token wholesale.
- **Role-dependent field visibility:** None found — the form is identical regardless of who's logged in.
- **"Whether certain users cannot be edited":** No such restriction exists — every row's Edit action is available unconditionally.
- **Role changes via this UI:** The `role` field is editable in both create and edit — but again, in the *live* enterprise UI, it's a hardcoded single-option dropdown, so in practice every user created/edited through this page today gets `role="supervisor"` regardless of intent. Changing to a different role is not currently possible through this screen (would require the richer legacy-style roles dropdown to be genuinely useful).

---

## 9. Master Data Required by User Management

| Data | Endpoint | Target (VERIFIED) | Response shape | Loaded when | Used for |
|---|---|---|---|---|---|
| Sites | `GET /v2/getAllSites?userId={parentId}` | **default** (GET always ignores flag) | `{ data: [{ siteId, siteName, address, pinCode }] }` | `ngOnInit()`, independently of the user list (`fetchSites()` runs in parallel with `getEmployees()`) | Populates the **Assigned site** `<select>` in the Add/Edit modal only. **Not used for any list filter** (User Management has no site filter at all — confirmed, §4). |
| Roles | `POST /v2/getAllRoles` | **default** | `{ data: [{ id, roleName }] }` | **Never, on the enterprise page** — `MasterDataService.getRoles()` exists and works (confirmed used by the legacy `AddEmployee`/`EditElist`) but is never injected/called by `UserManagementComponent` | Not used at all today by the live enterprise page — the Role dropdown is a hardcoded static option instead (§5) |
| Assignment/plan status | `GET /v2/{parentId}/assignment-status` | **default** | `{ data: { withinLimit, workerLimit, assignedCount, ... } }` (partial — UNKNOWN full shape) | Never on the enterprise page; only before every legacy create submission | Not used at all today by the live enterprise page |

No caching layer exists for any of these — each `ngOnInit()` triggers a fresh network call; nothing is memoized or shared across page visits (a full navigate-away-and-back re-fetches everything). Do not add master-data calls the enterprise page doesn't actually make (Roles, assignment-status) unless the team explicitly decides to backport the legacy behavior — see §18.

---

## 10. UI/UX Parity

### Enterprise page (the visual reference for Phase 3)
- Page heading: breadcrumb "SUPER ADMIN" (cosmetic label, copy-pasted across all enterprise pages including Attendance/Payments — not meaningful, don't treat as a real breadcrumb trail) + `<h1>User Management</h1>` + a right-aligned current date string.
- One card, "Team Directory," with a header row (title + subtitle copy) and two right-aligned buttons: "Bulk import" (dead, §7) and "Add user" (live).
- A single-row filter bar: one search `<input>` only (Role filter dropdown markup exists but is commented out, §4).
- Plain HTML `<table>`, no Angular Material — consistent with the "no Material anywhere in `enterprise-user/pages/**`" fact already established in `MIGRATION_TO_REACT.md` and Phases 0–2.
- Row actions are a `⋮` icon button opening a small dropdown menu (`activeMenuIndex` + `@HostListener('document:click')` to close on outside-click) — same interaction pattern already implemented in React for Attendance/Payments-style menus is not needed here since those pages don't have per-row menus; this will be a **new** shared pattern for this feature (a `useRef` + document click-outside hook, or a shadcn `DropdownMenu`, which is simpler and already used in `EnterpriseHeader.tsx` from Phase 0 — **recommend reusing shadcn `DropdownMenu` instead of hand-rolling Angular's manual index-tracking approach**, since the outcome is identical and shadcn's is already proven in this codebase).
- Add/Edit is an in-page modal overlay, not Material, not a route.
- No stat/summary tiles exist on this page at all (unlike Attendance/Payments) — confirmed absent from the template, don't invent any.

### Legacy employer page (visual reference only for the specific richer sub-behaviors called out above — NOT the primary visual reference)
- Angular Material table (`mat-table`) with 10 columns including several fields (Aadhar, Rate, F/H name, Pan no) that don't exist in the enterprise `User` interface at all.
- `MatDialog`-based edit modal, Material form fields throughout.
- **Do not use this page's visual language.** Per your instruction and consistent with Phases 0–2's precedent (enterprise pages don't use Material), the React implementation should visually match the **enterprise** page's plain-table-and-modal structure using shadcn/Tailwind — the legacy page is relevant only for the *business logic and reachable actions* documented in §5.1/§7, not for its look.

### A/B/C/D classification
- **A. Carry over as-is (enterprise UI is correct and live):** page heading, Team Directory card, search input, table with User/Mobile/Role/Site/Actions columns, row `⋮` menu with Edit, Add/Edit modal with its 4 real fields, "User does not match!" empty state (verbatim or lightly reworded — your call), loading text state.
- **B. Merely mocked / not live (do not port as functional):** the commented-out Role filter dropdown, the commented-out Status column/toggle, the dead Bulk-import button.
- **C. Real behavior elsewhere (legacy tree) that could be ported if desired:** real Roles API-backed dropdown, plan/worker-limit check, extra worker fields (Aadhar/PAN/rate/parent name/auto-generated-mobile), live reachable Delete-with-confirm, live reachable Bulk import via Excel.
- **D. Should be implemented via existing React/shadcn components rather than hand-rolled:** row action menu → shadcn `DropdownMenu` (already used in `EnterpriseHeader.tsx`); Add/Edit modal → shadcn `Dialog`; form → React Hook Form + the already-established manual-interface-decoupled-from-`z.infer` pattern from `Login.tsx` (Phase 0/1, still required — the zod/TypeScript version mismatch is unchanged); notifications → `sonner` (already the established choice from Phase 0, replacing Angular's native `alert()`); table → the plain shadcn `Table` primitives already used in `Attendance.tsx`/`Payments.tsx`.

---

## 11. Data Model — Exact Fields, No Invented Fallbacks

### `User` interface (enterprise page, `user-management.ts`) — this is the shape to type against for Phase 3's list
```ts
interface User {
  id: number;           // the user/subordinate's own ID. Rendered under the name. Sent back as `userId` on edit, and as `id` on delete.
  name: string;          // display name. Sent back verbatim on create/edit.
  mobileNumber: string;  // sent back verbatim.
  roleId: string;        // present on the interface but NEVER read/displayed/used anywhere in the component — confirmed dead field client-side (still presumably populated by the API).
  roleName: string;      // displayed as the Role badge; used for search matching and (dead) role-filter matching; used to patchValue the edit form's `role` control (see the §6 fragility note).
  siteId: number;        // used to patchValue the edit form's `site_id` control.
  siteName: string;      // displayed as "Assigned site"; used in search matching.
  active: number;        // 0 | 1. Only ever mutated by the dead, non-live `toggleStatus()` — never read for display (Status column is commented out) and never sent to any API.
}
```
All fields are read directly off the API's `subordinates[]` array elements with **no fallback chains, no denormalization, no group→flat transform** (unlike Attendance/Payments) — confirmed by direct assignment `this.users = res.subordinates`.

⚠ **The legacy tree's `ListEmployee` renders additional fields on what is presumably the exact same underlying subordinate record** (`aadharNumber`, `rate`, `parentName`, `panNumber`, `isGeneratedMobile`) that **do not appear in the enterprise `User` interface at all**. This strongly suggests the real `/v2/getSubordinate` response contains more fields than the enterprise page's TypeScript interface declares (TypeScript doesn't strip unlisted fields at runtime — the enterprise page simply never reads them). **Do not invent a full extended interface from this observation alone** — the legacy component types these as `any` and never declares a formal interface either. Mark exact typing for these extra fields as `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` (a single real `getSubordinate` response, inspected directly, would settle this in one look).

### Create/Edit payload fields (enterprise, confirmed exact)
```
Create → POST /v2/addSubordinate   body: { name, role, mobileNumber, siteId: number, parentUserId }
Edit   → POST /v2/editSubordinate  body: { name, role, mobileNumber, siteId: number, userId }
Delete → POST /v2/authenticate/permanentDeleteSubordinate  body: { id }
```
No timestamps, no created/updated-by fields, no email field exist anywhere in this feature.

---

## 12. Existing React Architecture — What to Reuse

Inventory of `src/app-desktop/` confirmed still present and correct from Phases 0–2 (re-verified by listing the directory, not assumed from memory):

| Existing piece | Reuse for User Management? |
|---|---|
| `api/httpClient.ts` (`api.get/post/put/delete`, `postBlob`, explicit `target` param, `ApiError`, 401 handling) | ✅ Reuse directly — this is the one API client for the whole app; no new client needed. `delete` verb exists on `api` already (though the real delete endpoint here is a `POST`, not an HTTP `DELETE` — confirmed, use `api.post`). |
| `auth/useAuth.ts`, `AuthContext.tsx` (session, `userId`, `parentId`) | ✅ Reuse — `session.parentId` is exactly `TokenService.getParentId()`'s equivalent, already correct from Phase 0. |
| `routes/ProtectedRoute.tsx`, `RoleRoute.tsx` | ✅ Already wraps `/enterprise/*` including `/enterprise/user-management` — no new route-guard code needed at all. |
| `hooks/useSites.ts` + `api/masterData.api.ts` (`getSites`, target `'default'`) | ✅ **Directly reusable, already correct** — built in Phase 2, confirmed the same endpoint/target/shape this feature needs. Only `getRoles()` needs to be added to `masterData.api.ts` (not yet built) — needed only if the team decides to backport the legacy roles dropdown (§18). |
| `components/shared/EmptyState.tsx`, `ErrorState.tsx`, `StatCard.tsx`, `StatusBadge.tsx`, `ExportButtons.tsx` | `EmptyState`/`ErrorState` ✅ reusable as-is. `StatusBadge` reusable *if* the team decides to resurrect a status column (not live in Angular today, §7 — optional). `StatCard`/`ExportButtons` — not needed, this feature has no stat tiles or exports. |
| `utils/downloadBlob.ts` | Not needed (no export/download capability in this feature). |
| `layouts/EnterpriseLayout.tsx`, `components/shell/*` | ✅ Already wraps every `/enterprise/*` page; no changes needed. |
| `pages/enterprise/UserManagement.tsx` | Currently the Phase-0 placeholder — this is the file Phase 3 replaces. |
| Toast system | ✅ `sonner`, already the established choice (Phase 0 decision) — replaces Angular's `alert()` calls. |
| Login's zod/RHF workaround (hand-written interfaces decoupled from `z.infer`, `Resolver<T>` cast) | ✅ Must reuse the same pattern for the Add/Edit form — the underlying zod/TypeScript version mismatch is unchanged since Phase 0/1. |

**Nothing new needs to be built at the infrastructure level.** This feature is additive: new types, one new API module, a couple of new hooks, and the page/dialog components themselves.

---

## 13. Recommended React File Plan (design only — no code written)

```
src/app-desktop/
├── types/
│   └── userManagement.ts        # User interface (§11, exact fields — no invented fallbacks), CreateUserPayload, EditUserPayload
├── api/
│   ├── userManagement.api.ts    # getEmployees (target: default), addEmployee (target: enterprise),
│   │                             # editSubordinate (target: enterprise), deleteEmployee (target: default) — matches §3 exactly
│   └── masterData.api.ts        # MODIFY (already exists) — add getRoles() only if §18's roles-dropdown decision is "yes"
├── hooks/
│   ├── useEmployees.ts          # useQuery wrapping getEmployees — replaces Angular's ngOnInit + loadingUsers signal
│   ├── useAddEmployee.ts        # useMutation wrapping addEmployee, invalidates the employees query on success
│   ├── useEditEmployee.ts       # useMutation wrapping editSubordinate, invalidates on success
│   └── useDeleteEmployee.ts     # useMutation wrapping deleteEmployee — ONLY if §18's delete decision is "yes"
├── components/
│   └── userManagement/
│       ├── UserFormDialog.tsx   # shadcn Dialog + React Hook Form, replaces the Angular in-page modal; handles both create and edit via a mode prop, exactly like Angular's single addUserForm/isEditMode pattern
│       └── UserRowActions.tsx   # shadcn DropdownMenu, replaces the Angular ⋮ menu + activeMenuIndex/HostListener pattern
└── pages/enterprise/
    └── UserManagement.tsx       # MODIFY (currently a Phase-0 placeholder) — page shell, search input, table, wires the above
```

- **`types/userManagement.ts`** — purpose: typed contracts for the list row and both mutation payloads; replaces the inline `interface User` duplicated per-Angular-file. Contains no API logic.
- **`api/userManagement.api.ts`** — purpose: the four real endpoint calls with their **verified** targets baked in (not a per-call flag the caller can get wrong, unlike Angular's easy-to-misuse boolean parameter — this is a concrete improvement matching the "fix, don't reproduce" precedent already set for the four Phase-0 bugs). Replaces `EmployeeManagementService`.
- **Hooks** — purpose: TanStack Query wrappers; replace Angular's manual `loading`/`error` signals and manual `getEmployees()` re-call pattern.
- **`UserFormDialog.tsx`** — purpose: the create/edit form UI; replaces both the enterprise page's inline modal markup and (conceptually) the legacy `EditElist`/`AddEmployee` dialogs, but scoped to the enterprise page's actual 4-field reality unless §18 extends it.
- **`UserRowActions.tsx`** — purpose: per-row menu; replaces the manual `activeMenuIndex` + `HostListener` pattern with shadcn's `DropdownMenu` (already proven in `EnterpriseHeader.tsx`).
- **`UserManagement.tsx`** — purpose: page shell wiring search state, the table, and the dialog/menu components together; replaces `UserManagementComponent` itself.

No new state-management library is needed or justified — TanStack Query (already installed, already used for Attendance/Payments/Sites) plus local `useState` for search text and dialog open/edit-mode state is sufficient, exactly mirroring Angular's own signal-based local state.

---

## 14. Query / Cache Design

| Hook | Query key | Type | Notes |
|---|---|---|---|
| `useEmployees` | `["employees", parentId]` | `useQuery` | `parentId` = `session.parentId`. **No `keepPreviousData`/`placeholderData`** — unlike Attendance/Payments, there's no date-range gating or "avoid clearing the table while typing an incomplete filter" scenario here; the list only ever refetches on an explicit invalidation (after create/edit/delete) or a hard remount, so the Angular-equivalent behavior (always show fresh-or-loading, never stale-while-typing) is simplest and most correct without it. |
| `useSites` | `["sites", userId]` | `useQuery` | **Already exists from Phase 2** — reuse verbatim, no change. |
| `useRoles` (only if §18 says yes) | `["roles"]` | `useQuery` | No `userId`/`parentId` dependency — roles are global, not scoped per Angular's `getRoles()` call signature (it takes no arguments). |
| `useAddEmployee` | — | `useMutation` | `onSuccess`: `queryClient.invalidateQueries({queryKey: ["employees", parentId]})` — replaces Angular's manual `getEmployees()` call after success. Matches Angular's "always refetch, no optimistic update" behavior for this action (confirmed — Angular does a full refetch here, not an optimistic push). |
| `useEditEmployee` | — | `useMutation` | Same invalidation. Angular also does a full refetch here (not the optimistic-merge pattern used by Site Management's edit — that's a different feature, not relevant here). |
| `useDeleteEmployee` (only if §18 says yes) | — | `useMutation` | Same invalidation pattern, mirroring the legacy `ListEmployee`'s `getEmployees()`-after-success behavior. |

`placeholderData: keepPreviousData` is deliberately **not** recommended anywhere in this feature — that pattern was justified for Attendance/Payments specifically because of date-range input gating (Phase 2's rationale). Nothing analogous exists here; using it anyway would be applying a pattern without the UX justification your Phase 3 brief explicitly warned against.

---

## 15. Migration Risks

| # | Risk | Severity | How to verify |
|---|---|---|---|
| 1 | **`addSubordinate`/`editSubordinate` receive materially different payload shapes from the two Angular callers** (`siteId` vs `site_id`, hardcoded vs. real `role`, presence/absence of `isGeneratedMobile`/`rate`/`aadharNumber`/`panNumber`/`parentName`) hitting the **same endpoint** | **HIGH** | Confirm with the backend team which shape the endpoint actually expects/tolerates today. If the backend silently ignores unknown keys and defaults missing ones, both callers "work" by accident; if it's strict, one of the two live Angular flows may already be subtly broken in production. This must be resolved **before** deciding the React payload shape — do not silently pick one. |
| 2 | **`addSubordinate`/`editSubordinate` hit different API base URLs depending on which Angular UI is used** (enterprise: `enterprise` target; legacy: `default` target) | **HIGH** | Same root cause as Phase 2's Attendance/Payments target confusion, but this time it's a *write* path, not read-only — confirm with backend which base URL is authoritative for subordinate writes before Phase 3 ships, since writing to the wrong backend on a create/edit is worse than a wrong read. |
| 3 | **Edit's `role` patchValue fragility** — patches a free-text `roleName` into a `<select>` with exactly one lowercase-valued option | MEDIUM | Confirm the exact casing of `roleName` values returned by `/v2/getSubordinate` for real records; if it's ever anything other than the literal string used in the dropdown, edit-mode role selection silently shows blank in Angular today — decide whether to reproduce or fix in React. |
| 4 | **Delete exists as real, working backend logic but has no live trigger in the target route** | MEDIUM | Product decision required (§7, §18) — not a technical unknown, but shipping without asking risks either under- or over-building relative to what stakeholders expect from "User Management." |
| 5 | **Role dropdown is a single hardcoded option in the live route**, while a fully-working roles API + richer form exists one route over | MEDIUM | Same category as #4 — a product scoping decision, not a technical one. |
| 6 | **Extra subordinate fields observed only in the legacy list** (aadhar/rate/PAN/parent name) may exist on every real record from `/v2/getSubordinate` but are untyped anywhere | LOW–MEDIUM | A single real API response inspected directly would resolve this immediately; until then, don't invent a formal type for these fields. |
| 7 | **No visible error state in Angular today** for a failed list load (silent `console.error` only) | LOW | Not a migration risk to ship *around* — recommend improving on it in React (already established as your team's general preference from Phase 0's bug-fix decisions), but flag to product since it's an intentional behavior change from parity. |
| 8 | **`getAssignStatus` response shape only partially known** | LOW | Only relevant if §18's plan-limit-check decision is "yes." A live call would resolve this in one look. |
| 9 | **No pagination anywhere** — a very large subordinate list has no client-side virtualization/pagination in Angular either | LOW | Not a migration risk per se (matching source behavior exactly), but worth a product note if any enterprise customer has a very large team — out of scope for a parity-first Phase 3. |
| 10 | **Stale data / race conditions**: no request de-duplication or in-flight cancellation exists in Angular (no `switchMap`, just a plain `.subscribe()` per call) | LOW | TanStack Query's default behavior (request de-dup by query key, automatic cancellation on key change) is already strictly better than Angular here — no special handling needed, just don't regress by hand-rolling raw `fetch` calls outside the query hooks. |

---

## 16. Recommended Implementation Order

1. `types/userManagement.ts` (§11 — exact fields only)
2. `api/userManagement.api.ts` (§3 — targets exactly as verified; get §18's decisions locked in first for delete/roles before wiring those specific calls)
3. `hooks/useEmployees.ts` (list query)
4. Page shell (`UserManagement.tsx`): heading, card, search input wired to client-side filter (name/mobile/site substring match, matching §4 exactly)
5. Table rendering with the 5 confirmed live columns + loading/"User does not match!" empty state
6. `UserRowActions.tsx` (Edit-only initially, per the live-today scope — add Delete only after §18's decision)
7. `UserFormDialog.tsx` create mode + `useAddEmployee` mutation, wired to the real `sites` dropdown (reusing Phase 2's `useSites`)
8. `UserFormDialog.tsx` edit mode + `useEditEmployee` mutation (patch fields from the row, exactly matching §6)
9. Authorization — no new work needed, confirm `/enterprise/user-management` inherits `ProtectedRoute`/`RoleRoute` correctly (it already does, via `App.tsx`'s existing route tree)
10. Loading/error/empty states polish (recommend a visible error toast/banner on list-load failure — a deliberate, flagged improvement over Angular's silent failure, per your team's established "fix real gaps" precedent)
11. Visual parity pass against the enterprise page's actual layout (§10)
12. Resolve any §18 "recommendation" items the team has signed off on (Delete, real roles dropdown, extra fields) — implement only what's approved
13. `tsc --noEmit`, `eslint`, `vite build` verification (same gate used every phase so far)

This order deliberately front-loads List (lowest risk, already-real, no payload-shape ambiguity) before Create/Edit (where the payload-shape and target risks in §15 need to be settled first).

---

## 17. Manual Verification Checklist (for the implementation phase, not this audit)

- [ ] Route access: `/enterprise/user-management` loads only for an authenticated `ENTERPRISE`-role session
- [ ] Unauthenticated access redirects to `/auth/login`
- [ ] Wrong-role authenticated access redirects via `getRedirectRoute` (not to this page)
- [ ] User list loads on mount and shows the loading state briefly
- [ ] Search filters by name, mobile, and site substring (case-insensitive), live per keystroke
- [ ] No role filter is present (confirm intentionally, matching live Angular)
- [ ] No pagination controls are present (confirm intentionally)
- [ ] Create: all 4 fields validate per §5's exact rules; submit disabled while invalid; success toast + list refresh + dialog close; failure toast, form retains entered values
- [ ] Edit: opens pre-filled from the row's data (no extra fetch); submit sends `userId`; success/failure behavior matches Create's pattern
- [ ] Whatever §18 decision was made on Delete is implemented exactly as decided (either genuinely absent, or present with a real confirm step) — not left as a dead button
- [ ] Site dropdown in the form is populated from the real `getSites()` call, not hardcoded
- [ ] Role dropdown matches whatever §18 decided (single hardcoded option for strict parity, or the real roles API if backported)
- [ ] API errors on list load are handled per the decided approach (silent per parity, or visible per the recommended improvement) — not left inconsistent
- [ ] Empty state renders when a search matches nothing
- [ ] Browser reload on `/enterprise/user-management` while authenticated preserves session and reloads the list correctly
- [ ] Logout from this page clears session and redirects to `/auth/login`
- [ ] Public website routes (`/`, `/features`, `/pricing`, `/faq`, `/blog`, `/kamet/*`) remain fully unaffected
- [ ] `tsc --noEmit`, `eslint`, `vite build` all clean

---

## 18. Source-of-Truth Matrix

| Capability | Angular `enterprise-user` | Angular legacy/`employer` | Real source of truth | React implementation recommendation | Confidence |
|---|---|---|---|---|---|
| List users | Real, live, reachable | Real, live, reachable (different route/role) | **enterprise-user** (it's the route being migrated, and it's genuinely real — not mocked) | Port enterprise-user's list logic exactly (§4) | High |
| Search | Real, live (name/mobile/site substring) | Not present (legacy has no search box) | **enterprise-user** | Port exactly | High |
| Role filter | Coded but commented out — **not live** | Not present | **Neither is live** | Do not implement; it doesn't exist in the running app today. Optional future add if product wants it. | High |
| Site/manager/worker filter | Does not exist at all | Does not exist at all | N/A | Do not implement — would be invented | High |
| Pagination | Does not exist | Does not exist | N/A | Do not implement | High |
| Create user (basic 4 fields) | Real, live, reachable | Real, live, reachable (richer, different payload shape) | **enterprise-user**, for the route in scope | Port enterprise-user's exact 4-field flow + exact payload shape (§5) | High |
| Create user — real roles dropdown | Hardcoded single option | Real `getRoles()`-backed dropdown | **legacy** has the real capability; enterprise-user's is a stub | **Recommend porting the legacy roles dropdown into the enterprise UI** — needs your explicit sign-off (§15 risk #5), not a silent default | Medium — technically clear, but a scope decision |
| Create user — extra fields (Aadhar/PAN/rate/parent name/auto-mobile) | Not present | Real, live | **legacy** | Do not add unless the team decides User Management's scope should expand beyond the 4 fields the live enterprise page uses today | Medium — same, scope decision |
| Create user — plan/worker-limit check | Not present | Real, live | **legacy** | Do not add unless backported deliberately | Medium — scope decision |
| Edit user | Real, live, reachable | Real, live, reachable (richer fields, different payload, `MatDialog`) | **enterprise-user**, for the route in scope | Port enterprise-user's exact edit flow (§6), including the confirmed role-patch fragility (flag, don't silently fix without a decision) | High |
| Delete | Real API, **UI trigger commented out — not reachable** | Real API, **UI trigger live and reachable, with a real confirm() dialog** | **legacy** for reachability; **shared service** for the API itself | **Explicit product decision needed** (§7, §15 risk #4): implement using the legacy's confirm-dialog pattern, or omit entirely to match the enterprise page's current live behavior | Medium — technically clear, ships-or-not is a scope decision |
| Activate/Deactivate/status | Coded (`toggleStatus`) but **UI commented out and never calls an API** | Not present in this form at all | **Neither** — this is dead code everywhere | Do not implement | High |
| Bulk import | Button visible, **zero click handler — decorative only** | Real, live, wired to `uploadExcel()` | **legacy** | Do not implement on the enterprise page unless explicitly backported — same category as the roles dropdown/extra fields | High confidence it's currently dead on enterprise-user; medium on whether to port |
| Role assignment (i.e., changing role via edit) | Technically possible via the form, but constrained to the one hardcoded value | Real, full role reassignment via a real dropdown | **legacy** for real capability; **enterprise-user** for what's live today | Same scope decision as the roles dropdown above | Medium |
| Site assignment | Real, live, backed by the real `getSites()` API | Real, live, same underlying API | **Both — identical, no conflict** | Port directly, reuse Phase 2's `useSites` | High |
| Master data (sites) | Real, live | Real, live | **Shared, identical, no conflict** | Reuse existing `useSites`/`masterData.api.ts` unchanged | High |
| Master data (roles) | Not called | Real, live | **legacy** | Add only if the roles-dropdown decision above is "yes" | High |
| API target for list/delete | `default` (verified) | `default` (verified, consistent) | **No conflict — both `default`** | Use `default` | High |
| API target for create/edit | `enterprise` (verified) | `default` (verified) — **conflicts with enterprise-user** | **Ambiguous — needs backend confirmation (§15 risk #1, #2)** | Default to matching enterprise-user's own live behavior (`enterprise`) since that's the route being migrated, but flag prominently for backend sign-off before shipping | Medium — verified from source, but the cross-implementation conflict itself is the unresolved part |
| Validation rules (name/mobile/role/site required; mobile pattern) | Real, live | Real, live, plus several additional optional-field patterns | **enterprise-user**, for the 4 fields in scope | Port exactly (§5) | High |

---

## 19. Final Recommendation

1. **Exact Angular files that are the functional source of truth for Phase 3, in scope:**
   - `src/app/features/enterprise-user/pages/user-management/user-management.ts` + `.html`
   - `src/app/core/services/employee-management.service.ts`
   - `src/app/core/services/master-data.service.ts` (for `getSites` only, at this scope)
   - `src/app/core/services/api.service.ts` (for target resolution — already fully traced)
   - `src/app/core/guards/auth.guard.ts` / `role.guard.ts` (already superseded by the corrected React `ProtectedRoute`/`RoleRoute` — no new work, just confirmation)

2. **Exact Angular services that are the source of truth:** `EmployeeManagementService`, `MasterDataService`, `TokenService` (for `getParentId()`).

3. **Exact API endpoints (in scope for Phase 3's baseline):**
   - `POST /v2/getSubordinate` — list
   - `POST /v2/addSubordinate` — create
   - `POST /v2/editSubordinate` — edit
   - `POST /v2/authenticate/permanentDeleteSubordinate` — delete (pending §18 go/no-go)
   - `GET /v2/getAllSites?userId={parentId}` — site lookup (already built, Phase 2)
   - Conditionally, if §18's roles/extra-fields/plan-limit decisions are "yes": `POST /v2/getAllRoles`, `GET /v2/{parentId}/assignment-status`, `POST /v2/upload-excel`

4. **Exact API targets — all VERIFIED FROM SOURCE, none inferred:**
   - List: `default`. Create: `enterprise`. Edit: `enterprise`. Delete: `default`. Sites: `default`. Roles: `default`. Assignment-status: `default` (GET always ignores flag). Excel upload: `default`.
   - **Flagged for backend confirmation before shipping:** whether `enterprise` is truly correct for create/edit given the legacy tree's conflicting `default`-target calls to the identical endpoints (§15 risk #2).

5. **Exact response shapes:**
   - List: `{ status: 'SUCCESS', subordinates: User[] }` (not `{data: [...]}`).
   - Create/Edit/Delete: no documented success-body contract is read by any caller — treat as "2xx = success, anything else = error," matching Angular exactly.
   - Sites: `{ data: Site[] }` (already correct in React from Phase 2).
   - Roles: `{ data: [{id, roleName}] }` (only relevant if backported).

6. **Exact React files to create/modify:** see §13's full tree — `types/userManagement.ts`, `api/userManagement.api.ts`, `hooks/useEmployees.ts` + 2–3 mutation hooks, `components/userManagement/UserFormDialog.tsx` + `UserRowActions.tsx`, and modifying the existing `pages/enterprise/UserManagement.tsx` placeholder. No changes to routing, guards, layout, or any other existing infrastructure file.

7. **Unresolved `UNKNOWN` items:**
   - `DESKTOP_REACT_ARCHITECTURE.md` does not exist in the repo — confirm with the team whether it was supposed to.
   - Full field set and types of extra subordinate fields seen only in the legacy list (`aadharNumber`, `rate`, `parentName`, `panNumber`, `isGeneratedMobile`) on the real `/v2/getSubordinate` response.
   - Full response schema of `GET /v2/{parentId}/assignment-status` beyond `withinLimit`/`workerLimit`/`assignedCount`.
   - Exact casing/values of `roleName` as returned by the real API (affects whether the edit-form role-patch bug, §6/§15, is actually observable in practice).

8. **Items requiring live backend verification:**
   - Whether `addSubordinate`/`editSubordinate` truly require/tolerate both the `siteId` (camelCase) and `site_id` (snake_case) payload key variants, and both the `enterprise` and `default` targets, without silently corrupting or duplicating data.
   - Whether the backend enforces any authorization beyond "valid token," given the frontend has none (§8).

9. **Recommended implementation order:** as detailed in §16 — types → API module → list query/hook → page shell/table/search → row actions (Edit only, initially) → create dialog/mutation → edit dialog/mutation → authorization confirmation (already satisfied) → loading/error/empty polish → visual parity → resolve any approved §18 scope extensions → full verification gate (`tsc`/`eslint`/`vite build`).

---

**No application source files were modified to produce this audit.** Only this document (`USER_MANAGEMENT_AUDIT.md`) was created.
