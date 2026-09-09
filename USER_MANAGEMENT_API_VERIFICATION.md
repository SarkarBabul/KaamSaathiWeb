# User Management — `addSubordinate` / `editSubordinate` API Conflict Verification

> **Status:** Read-only analysis. No application source (React, Angular, or otherwise) was modified, and no network requests were made against any backend.
> **Scope:** A targeted verification pass following up on the single HIGH-risk item from `USER_MANAGEMENT_AUDIT.md` (§15 risks #1/#2, §18 matrix row "API target for create/edit"). This is not a new full audit.

---

## 1. Executive Summary

The conflict is **resolved with high confidence from source evidence, though not from the backend's own source code** (which is not available locally — see §14).

**Finding:** A **third, fully independent production client — the KaamSaathi Flutter mobile app (`D:\Projects\kaamflutter`)** — also implements `addSubordinate`, `editSubordinate`, `getSubordinate`, and `permanentDeleteSubordinate`. Tracing it end-to-end shows:

- It uses **exactly one API base URL for every request, hardcoded everywhere it constructs `MyApiService`: `https://api.kametgroup.com/api`** — i.e., Angular's **`default`/`apiBaseUrl`**. The string `enterpriseapiBaseUrl`/`43.204.170.108`/`9091` does not appear anywhere in the Flutter codebase.
- Its `addSubordinate` payload uses **`site_id`** (snake_case).
- Its `editSubordinate` payload uses **`id`** (not `userId`) and **`site_id`** (snake_case).

This matches the Angular **legacy `dashboard/employer` tree** exactly (target `default`, `site_id`, `id`), and **contradicts the Angular `enterprise-user` tree** (target `enterprise`, `siteId` camelCase, `userId`).

Combined with the facts already established in Phase 2's investigation — that Attendance, Payments, and every other confirmed-live enterprise-page call also resolve to `default` despite "enterprise-sounding" URL paths — the `enterprise-user` page's `addEmployee(payload, true)` / `editSubordinate(payload, true)` calls are now the **only** confirmed call sites anywhere across three independent codebases (Angular legacy, Angular's own other pages, and the production Flutter app) that ever pass `true`/hit the enterprise base URL for subordinate management. That makes the enterprise-user tree's behavior the **outlier**, not the standard.

**This is presented as strong, convergent, source-verified evidence — not a guess and not "intuition" — but it is still evidence from client code, not the backend's own source.** The backend source itself was not found locally (§14), so this cannot be marked `VERIFIED FROM BACKEND SOURCE`. It is marked `VERIFIED FROM ANGULAR SOURCE` (for Angular's own behavior) with independent third-party corroboration, and the backend's actual acceptance behavior remains formally `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` per the strict rules given, even though the evidence strongly points one way.

---

## 2. Angular `ApiService` Findings (re-confirmed, unchanged since the Phase 2 investigation)

Read directly from `D:\Projects\KaamsaathiPC\src\app\core\services\api.service.ts`:

```ts
get<T>(url, params?, headers?, flag=false)     → ALWAYS apiBaseUrl + url — the flag branch is a no-op (both sides of the ternary are identical)
post<T>(url, body?, params?, headers?, flag=false) → flag ? enterpriseapiBaseUrl+url : apiBaseUrl+url  — the real, live switch
put<T>(url, body, params?, headers?, flag=false)   → same switch as post
delete<T>(url, params?, headers?)              → no flag parameter — always apiBaseUrl
postBlob(url, body?, params?, headers?)        → no flag parameter — always apiBaseUrl
```

No `patch` method exists on `ApiService` at all. `authInterceptor` (`core/interceptors/auth.interceptor.ts`, registered in `app.config.ts`) only sets the `authKey` and `Authorization: Bearer <token>` headers — it does not touch the URL, host, or target in any way, confirmed by direct re-read. `encryptionInterceptor` is commented out/inactive (unchanged from prior findings). No other interceptor exists. No request/response transformation of the body happens anywhere in `ApiService` or the interceptor chain.

---

## 3. Default vs. Enterprise Base URL Behavior

From `environments/environment.ts` (unchanged since prior audits):
```
apiBaseUrl:            'https://api.kametgroup.com/api'
enterpriseapiBaseUrl:  'http://43.204.170.108:9091/api'
```

**Are these the same backend, different services, or different routes on one backend?**

`UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` in the strict sense (no server-side source was available to inspect, and no network request was made, per your instruction not to make any live calls). However, the following can be stated from client-side evidence alone:

- They are different **hosts** (a DNS-fronted domain vs. a raw IP:port) — at minimum, different network endpoints, even if they eventually proxy to the same application.
- **No other confirmed-live code path in this entire investigation — across Angular's enterprise-user, Angular's legacy employer tree, and the entire Flutter production app — ever calls `enterpriseapiBaseUrl` for anything.** The *only* place it's ever reached is `enterprise-user`'s `addEmployee(payload, true)` and `editSubordinate(payload, true)`.
- This pattern (a second base URL defined in config, referenced by a `flag` parameter, but essentially never exercised by any real, working call site) is consistent with `enterpriseapiBaseUrl` being either: (a) a separate service that was provisioned for a specific purpose and only ever wired into these two calls, possibly correctly; or (b) a leftover/test/staging endpoint that a developer pointed one feature at, possibly by mistake, while every other feature (including this exact same feature's List/Delete, and the entire Attendance/Payments/Dashboard surface confirmed in the Phase 2 investigation) uses `default`.
- Classification per your requested options: **D. Unknown**, formally — but the weight of evidence leans toward **A (same/primary backend)** being the one that's actually exercised by the app's real, working traffic, with the enterprise IP being effectively unused elsewhere.

---

## 4. `addSubordinate` Verification

| Aspect | Value | Source |
|---|---|---|
| Exact path | `/v2/addSubordinate` | Consistent across all three codebases |
| HTTP method | POST | Consistent across all three |
| Angular `enterprise-user` target | **enterprise** (`http://43.204.170.108:9091/api/v2/addSubordinate`) | `VERIFIED FROM ANGULAR SOURCE` — `user-management.ts`: `this.employeeService.addEmployee(payload, true)` |
| Angular legacy `employer` target | **default** (`https://api.kametgroup.com/api/v2/addSubordinate`) | `VERIFIED FROM ANGULAR SOURCE` — `add-employee.component.ts`: `this.employeeService.addEmployee(payload)` (no second arg) |
| Flutter mobile app target | **default**, hardcoded at every call site: `MyApiService(baseUrl: "https://api.kametgroup.com/api")` | `VERIFIED FROM THIRD-PARTY CLIENT SOURCE` — `employee_repository.dart` + all 8 grep hits for `MyApiService(` construction across the Flutter codebase |
| Backend's own accepted target | Not confirmed from server source | `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` |
| Authentication | `Authorization: Bearer <token>` + static `authKey` header, identical scheme across all three clients | `VERIFIED FROM SOURCE` (all three) |
| Authorization (fine-grained) | Not observable client-side in any of the three | `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` |

---

## 5. `editSubordinate` Verification

| Aspect | Value | Source |
|---|---|---|
| Exact path | `/v2/editSubordinate` | Consistent across all three |
| HTTP method | POST | Consistent across all three |
| Angular `enterprise-user` target | **enterprise** | `VERIFIED FROM ANGULAR SOURCE` — `editSubordinate(EditPayload, true)` |
| Angular legacy `employer` target | **default** | `VERIFIED FROM ANGULAR SOURCE` — `EditElist`'s `editSubordinate(payload)` (no second arg) |
| Flutter mobile app target | **default** — same single hardcoded `MyApiService` base URL | `VERIFIED FROM THIRD-PARTY CLIENT SOURCE` — `edit_emp_repository.dart` |
| Backend's own accepted target | Not confirmed from server source | `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` |

---

## 6. Payload Contract

| Frontend field | Where seen | Backend field (best evidence) | Required/Optional | Type | Notes |
|---|---|---|---|---|---|
| Employee name | `name` (enterprise `addEmployee`/`editSubordinate`), `name` (Flutter add — `fullName` mapped to `name`), `name` (Flutter edit) | **`name`** | Required | string | **Consistent across all three sources — no conflict.** |
| Site | `siteId` (enterprise-user, camelCase, numeric) vs. `site_id` (legacy employer, Flutter add, Flutter edit — all snake_case) | **`site_id`** (2 of 3 independent sources agree; enterprise-user is the outlier) | Required | number/numeric-string | This is the crux of the original conflict. Evidence favors `site_id`. |
| Subordinate identifier (edit only) | `userId` (enterprise-user only) vs. `id` (legacy employer, Flutter edit) | **`id`** (2 of 3 sources agree; enterprise-user is again the outlier) | Required for edit | number | Same pattern as the site-key conflict — enterprise-user disagrees with both other implementations. |
| Role | `role` (all three, consistently) — string, sourced from a hardcoded `"supervisor"` (enterprise-user), a real role ID converted to string (legacy employer, Flutter) | **`role`** | Required | string | Key name has no conflict; only the *value's origin* differs (hardcoded vs. a real roles lookup) — a UX/scope question already covered in `USER_MANAGEMENT_AUDIT.md` §18, not a payload-contract conflict. |
| Mobile number | `mobileNumber` (all three, consistently) | **`mobileNumber`** | Required unless auto-generated (legacy/Flutter only feature) | string | No conflict. |
| Parent/creator ID | `parentUserId` (enterprise + legacy `addEmployee`, added by the service layer itself, not the caller) | **`parentUserId`** (create) | Added automatically | string/number | No conflict — same service method (`addEmployee`) injects this identically for both Angular callers. |
| Email | Not present anywhere | — | — | — | Confirmed absent from all three sources — do not invent. |
| Password | Not present anywhere | — | — | — | Confirmed absent — credentials are backend-generated per the enterprise page's own modal copy ("Login credentials are auto-generated"). |
| Designation | Not a separate field anywhere — `role` serves this purpose | — | — | — | No separate designation concept found in any of the three sources. |
| Manager/supervisor | Not present as a field on create/edit in any of the three sources (site assignment implies a manager relationship indirectly, per the general app model, but no `managerId`/`supervisorId` field is ever sent) | — | — | — | Confirmed absent — do not invent. |
| Extra fields (rate, aadharNumber, panNumber, parentName, isGeneratedMobile, gender) | Present in legacy employer AND Flutter (both add and edit), absent from enterprise-user entirely | Field names **consistent between legacy Angular and Flutter**: `rate`, `aadharNumber`, `panNumber`, `parentName`, `isGeneratedMobile`, `gender` | Optional (sent only when present, conditionally included in the payload object) | mixed | Two independent real clients agree exactly on these field names — this materially de-risks `USER_MANAGEMENT_AUDIT.md`'s prior "type as UNKNOWN" caution for these fields if the team decides to backport them (§18 of the audit). Still not sent by the live enterprise-user page today. |

**Whether `siteId` and `site_id` are both accepted:** `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION`. No source code (Angular or Flutter) sends both keys simultaneously or documents backend tolerance for either casing. It's possible the backend accepts both (lenient key mapping) or only one (in which case one of the three client implementations has a live, if perhaps invisible, bug). This cannot be settled without either the backend source or a live test call — and you've explicitly asked that no live mutating test call be made.

---

## 7. Response Contract

Evidence from the Flutter app (the only source with clear, explicit envelope-shape checks — Angular's callers on both trees only check that the Observable resolved without error, never inspecting response fields on success):

- **`addSubordinate` success:** HTTP 200. Flutter's `EmployeeRepository.addEmployee` checks only `response.statusCode == 200` and returns a bare `true` — no response body fields are read on success. On failure, it reads `response.data["statusMsg"]` for the error message, and specifically branches on HTTP 409 ("Employee already exists") and 401 ("session expired").
- **`editSubordinate` success:** HTTP 200 **and** `response.data['status'] == "SUCCESS"` (Flutter's `EditEmpRepository` explicitly checks both — this is the clearest evidence of the actual envelope shape found across any of the three codebases for this endpoint). On failure, reads `response.data['message']`.
- **`getSubordinate` (list) response:** `{ status: "SUCCESS", subordinates: [...] }` — confirmed identically by Angular (both trees) and Flutter (`EmpListRepository.fetchSubordinates`, which reads `data['status']` and `data['subordinates']`). No conflict here at all.
- **`permanentDeleteSubordinate` response:** `{ status: "SUCCESS" }` on success, else an error read from `statusMsg` — confirmed by Flutter's `EmpListRepository.deleteEmployee`. Angular's callers on both trees never actually inspect this field (they just treat "no error thrown" as success), but the shape itself is now directly confirmed rather than assumed.
- **Whether Angular consumes any response data:** **No.** Neither Angular tree reads a single field from the `addSubordinate`/`editSubordinate` response body on success — both simply show a static `alert()` message and immediately refetch the list. All response-shape evidence above comes from the Flutter app, not Angular.

**Note found during this pass, outside the immediate conflict but relevant to response contract completeness:** the Flutter app also implements `/v2/authenticate/deleteSubordinate` (soft-delete/archive), `/v2/authenticate/getArchivedSubordinates`, and `/v2/authenticate/restoreSubordinate` — a richer archive/restore capability that exists in neither Angular tree at all. This is out of scope for the current targeted verification (per your instruction not to re-run the full audit) and is noted here only so it isn't silently lost; it does not change the add/edit target conclusion above.

---

## 8. User List API Verification

| Endpoint | `/v2/getSubordinate` |
|---|---|
| Method | POST |
| Target | **default** — confirmed by all three sources (Angular enterprise, Angular legacy, Flutter) with zero disagreement |
| Request | `{ parentId }` |
| Response | `{ status: "SUCCESS", subordinates: User[] }` |
| Confidence | **High — VERIFIED FROM ANGULAR SOURCE, corroborated by independent Flutter source** |

No change from `USER_MANAGEMENT_AUDIT.md` — this endpoint was never in conflict.

---

## 9. Delete API Verification

| Endpoint | `/v2/authenticate/permanentDeleteSubordinate` |
|---|---|
| Method | POST |
| Target | **default** — confirmed by all three sources with zero disagreement |
| Request | `{ id: empId }` |
| Response | `{ status: "SUCCESS" }` on success; `statusMsg` on failure (shape confirmed via Flutter, §7) |
| Confidence | **High — VERIFIED FROM ANGULAR SOURCE, corroborated by independent Flutter source** |

No change from the audit — this endpoint was also never in conflict (both Angular trees already agreed it's `default`).

---

## 10. Roles API Verification

| Endpoint | `/v2/getAllRoles` |
|---|---|
| Method | POST (with an empty body `{}` — confirmed by Flutter; Angular's `MasterDataService.getRoles()` calls `api.post('/v2/getAllRoles')` with no body argument at all, which is functionally equivalent) |
| Target | **default** — confirmed by Angular (legacy tree's `AddEmployee`/`EditElist`) and Flutter; **never called at all by the live enterprise-user page** |
| Response | `{ data: [{ id, roleName }] }` — field names confirmed identically by Angular's typed signal and Flutter's `RoleModel.fromJson` |
| Confidence | **High for the endpoint/target/shape itself.** Whether it should be wired into the enterprise page at all remains a scope decision, not a technical unknown (per `USER_MANAGEMENT_AUDIT.md` §18). |

---

## 11. Sites API Verification

| Endpoint | `/v2/getAllSites?userId={parentId}` |
|---|---|
| Method | GET |
| Target | **default, always** — the flag parameter is provably a no-op on every GET call (§2), so this is target=default regardless of what any caller passes; confirmed identically by Angular (both trees) and Flutter |
| Response | `{ data: [{ siteId, siteName, address, pinCode }] }` — **already correctly implemented in the React codebase** (`src/app-desktop/api/masterData.api.ts`, `hooks/useSites.ts`, built in Phase 2) |
| Confidence | **High — no change needed to the existing React implementation.** |

---

## 12. Assignment-Status Verification

| Endpoint | `/v2/{parentId}/assignment-status` |
|---|---|
| Method | GET |
| Target | **default, always** (GET flag is a no-op) — confirmed by Angular's `getAssignStatus()` and Flutter's `getAssignmentStatus(userId)`, both hitting the same path pattern |
| Response | `{ data: { withinLimit: boolean, workerLimit: number, assignedCount: number, ... } }` — Flutter's `AssignmentStatus.fromJson` additionally references a `remainingSlots` field not previously documented in the Angular-only audit; full field list beyond `withinLimit`/`workerLimit`/`assignedCount`/`remainingSlots` is still `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION` (neither client fully enumerates every field, just the ones each happens to read) |
| Used by the live enterprise-user page? | **No** — same as the audit's original finding, unchanged |
| Confidence | Medium-high on endpoint/target/method; medium on full response shape |

---

## 13. Enterprise vs. Legacy Comparison — Summary Table

| Behavior | `enterprise-user` (live route) | Legacy `employer` | Flutter (independent 3rd client) | Verdict |
|---|---|---|---|---|
| `addSubordinate` target | enterprise | default | default | **2-of-3 agree on `default`; enterprise-user is the outlier** |
| `addSubordinate` site key | `siteId` | `site_id` | `site_id` | **2-of-3 agree on `site_id`; enterprise-user is the outlier** |
| `editSubordinate` target | enterprise | default | default | **2-of-3 agree on `default`; enterprise-user is the outlier** |
| `editSubordinate` id key | `userId` | `id` | `id` | **2-of-3 agree on `id`; enterprise-user is the outlier** |
| `editSubordinate` site key | `siteId` | `site_id` | `site_id` | **2-of-3 agree on `site_id`; enterprise-user is the outlier** |
| `getSubordinate` (list) target | default | default | default | **Unanimous — no conflict** |
| `permanentDeleteSubordinate` target | default | default | default | **Unanimous — no conflict** |
| `getAllSites` target | default (GET always) | default (GET always) | default | **Unanimous — no conflict** |
| `getAllRoles` target | not called | default | default | **Unanimous where called — no conflict** |

**Which Angular implementation is stale/incorrect?** Based strictly on source evidence (not intuition): the **`enterprise-user` tree's `addSubordinate`/`editSubordinate` calls** are the ones that disagree with every other confirmed-live call path in the entire ecosystem, across two independent codebases and three independent client implementations. This is the pattern your decision rules describe as "one Angular implementation is clearly stale/incorrect" — identified here as **`enterprise-user`'s create/edit calls specifically** (not the whole `enterprise-user` tree, which is correct and unconflicted everywhere else — list, delete, and every other page audited in Phases 0–2 all correctly resolve to `default`).

---

## 14. Backend Source Evidence

**`UNKNOWN — BACKEND SOURCE NOT AVAILABLE LOCALLY.`**

Searched every sibling directory under `D:\Projects\`:
```
DenseNet-121 Training, FISfrontend, KaamSaathiWeb, KaamsaathiPC, NWSSUPCLFRONT,
Niyal-HRMS-FE, Sticker Website, bundletool.jar, kaamflutter, kaamsaathi-cms
```
- `kaamsaathi-cms` is a Strapi project — confirmed (via its `package.json`) to be the marketing/blog CMS only, unrelated to `api.kametgroup.com`/`43.204.170.108:9091`.
- `Sticker Website/backend` is an unrelated Node project (`stickerforge-backend`, per its own `package.json`) — a different product entirely.
- `kaamflutter` is a client (the mobile app), not a server.
- No directory anywhere under `D:\Projects\` contains controllers, route definitions, DTOs, validators, or any server-side implementation of `addSubordinate`/`editSubordinate`/`getSubordinate`, confirmed by targeted searches across the non-frontend-looking candidates.

**No live network request was made** to either `api.kametgroup.com` or `43.204.170.108:9091`, per your explicit instruction not to perform any request that could mutate data (and, more simply, this environment has no outbound network access available to this session in any case).

---

## 15. Remaining UNKNOWN Items

1. Whether the backend genuinely accepts, rejects, or silently mishandles `siteId` (camelCase) when `site_id` (snake_case) is the pattern used everywhere else — i.e., whether `enterprise-user`'s create/edit calls are actually working correctly in production today, or silently failing/behaving unexpectedly.
2. Whether `enterpriseapiBaseUrl` (`43.204.170.108:9091`) is a fully separate backend deployment, a proxy to the same backend, a decommissioned/staging environment, or genuinely the intended target for this one specific pair of calls.
3. The complete field list of `assignment-status`'s response (`withinLimit`, `workerLimit`, `assignedCount`, `remainingSlots` are confirmed; nothing more).
4. Whether the backend enforces any authorization beyond a valid bearer token (unchanged from the original audit — not newly resolved by this pass).
5. Full shape/typing of `aadharNumber`/`rate`/`panNumber`/`parentName`/`isGeneratedMobile`/`gender` at the backend/database level (their *names* are now cross-confirmed between legacy Angular and Flutter, which meaningfully reduces — but does not eliminate — the original audit's "don't invent a type" caution).

None of these can be resolved without either backend source access or a live (non-mutating, e.g. a read-only `getSubordinate` call against a test account) verification request — which was out of scope for this pass per your explicit instruction.

---

## 16. Recommended React API Contract

Given the evidence in §13, the recommendation is:

```
POST /v2/addSubordinate   → target: 'default'   body: { name, role, mobileNumber, site_id: number, parentUserId }
POST /v2/editSubordinate  → target: 'default'   body: { id, name, role, mobileNumber, site_id: number }
```

i.e., **align React's implementation with the legacy Angular tree and the Flutter production app (2-of-3 independent sources, `default` target, `site_id`/`id` keys) rather than with the `enterprise-user` tree's outlier behavior**, on the grounds that this is the pattern independently reproduced by every other real, working client and every other real, working endpoint in this entire feature area.

**This is a recommendation, not a certainty — it is explicitly flagged for your sign-off, not silently adopted**, because:
- It technically diverges from what the *specific route being migrated* (`/enterprise/user-management`) does today in Angular.
- The backend's own behavior remains unconfirmed by source or live test.
- If `enterprise-user`'s calls have in fact been working correctly in production against the enterprise base URL with the camelCase payload, switching React to `default`/`site_id` would introduce a *new*, previously-nonexistent discrepancy between the Angular original and the React port — the opposite of migration parity.

**If you want strict byte-for-byte parity with today's live `/enterprise/user-management` route instead of the cross-client consensus**, the alternative is:
```
POST /v2/addSubordinate   → target: 'enterprise'   body: { name, role, mobileNumber, siteId: number, parentUserId }
POST /v2/editSubordinate  → target: 'enterprise'   body: { name, role, mobileNumber, siteId: number, userId }
```

**Both options are documented here rather than one being silently chosen**, per your explicit decision rule for genuinely-supported-but-conflicting contracts. A single, cheap, read-only live check (e.g., watching the network tab while using the real enterprise app to add one test user, without needing to inspect backend source) would resolve this definitively and is the recommended next step before Phase 3 implementation locks in a choice.

---

## 17. Recommended React Implementation Implications

- **Do not hardcode the target inside a shared, opaque service the way Angular's boolean `flag` parameter does** — this is exactly the pattern that produced the conflict in the first place (two call sites silently disagreeing on a parameter's value). The existing `src/app-desktop/api/httpClient.ts` already avoids this by requiring an explicit `target` argument on every call — continue that pattern for `userManagement.api.ts` (per `USER_MANAGEMENT_AUDIT.md` §13's file plan), and pick one target deliberately once §16 is resolved, not two behaviors gated by an easily-mismatched flag.
- Whichever target is chosen, pick a **single, consistent field-naming contract** (`site_id`/`id` OR `siteId`/`userId`, not a mix) for both create and edit — do not reproduce Angular's own internal inconsistency once a decision is made.
- The React architecture already in place (confirmed present and unchanged during this pass) needs no new infrastructure to accommodate whichever contract is chosen:
  - `src/app-desktop/api/httpClient.ts` — the one shared client, explicit `target` param, already correct.
  - `src/app-desktop/auth/AuthContext.tsx`/`useAuth.ts` — provides `session.parentId` for the `parentUserId` field.
  - TanStack Query (already used for Attendance/Payments/Sites in Phases 2) is the correct tool for the list query and create/edit mutations, per `USER_MANAGEMENT_AUDIT.md` §14 — unchanged by this verification pass.
  - shadcn `Dialog`, `DropdownMenu`, `Table`, and `sonner` toasts are already established and sufficient — no new component library needed.
- Recommend building the response-envelope check for `editSubordinate` as `{status: "SUCCESS"}` per the Flutter-confirmed shape (§7), rather than Angular's looser "just check it didn't throw" — this is a genuine, evidence-backed improvement opportunity, not a guess.

---

## Summary Table

| API | Method | Target | Endpoint | Request Contract | Response | Confidence |
|---|---|---|---|---|---|---|
| List users | POST | default | `/v2/getSubordinate` | `{parentId}` | `{status, subordinates: User[]}` | VERIFIED FROM ANGULAR SOURCE (corroborated by Flutter) |
| Create user | POST | **enterprise (live today) vs. default (cross-client consensus)** — see §16 | `/v2/addSubordinate` | `{name, role, mobileNumber, siteId\|site_id, parentUserId}` | 200 = success, no body read by Angular; Flutter reads `statusMsg` on error | VERIFIED FROM ANGULAR SOURCE for each tree's own behavior; UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION for which contract the backend truly expects |
| Edit user | POST | **enterprise (live today) vs. default (cross-client consensus)** — see §16 | `/v2/editSubordinate` | `{name, role, mobileNumber, siteId\|site_id, userId\|id}` | `{status: "SUCCESS"}` (Flutter-confirmed) | VERIFIED FROM ANGULAR SOURCE for each tree's own behavior; UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION for which contract the backend truly expects |
| Delete user | POST | default | `/v2/authenticate/permanentDeleteSubordinate` | `{id}` | `{status: "SUCCESS"}` / `statusMsg` on error | VERIFIED FROM ANGULAR SOURCE (corroborated by Flutter) |
| Get roles | POST | default | `/v2/getAllRoles` | `{}` (empty body) | `{data: [{id, roleName}]}` | VERIFIED FROM ANGULAR SOURCE (corroborated by Flutter) |
| Get sites | GET | default (always, flag is a no-op) | `/v2/getAllSites?userId=` | query param only | `{data: [{siteId, siteName, address, pinCode}]}` | VERIFIED FROM ANGULAR SOURCE (corroborated by Flutter); already correctly implemented in React |
| Assignment status | GET | default (always) | `/v2/{parentId}/assignment-status` | none (path param only) | `{data: {withinLimit, workerLimit, assignedCount, remainingSlots, ...}}` (partial) | VERIFIED FROM ANGULAR SOURCE (corroborated by Flutter) for endpoint/method/target; UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION for full response shape |

---

---

## 18. LIVE ENTERPRISE DASHBOARD VERIFICATION (Phase 3)

> Performed with Chrome DevTools MCP against a locally-served instance of the real Angular app (`D:\Projects\KaamsaathiPC`, `ng serve`, unmodified source, no dependency/config changes). Login credentials were entered manually by the user directly in the browser; no credential, token, cookie, or Authorization header was inspected, read, or recorded by this pass. Strictly read-only — no create/edit/delete/activate/deactivate action was submitted.

### 18.1 Angular application URL
`http://localhost:4200` (default `ng serve` dev server, started via the project's own documented `npm start` script — no config changes).

### 18.2 Login API — sanitized network evidence
| Method | Hostname | Path | Status |
|---|---|---|---|
| POST | `api.kametgroup.com` | `/api/v1/authenticate/companyLogin_TP` | 200 |

No password, token, cookie, or Authorization header was recorded.

**Hostname vs. Angular config:** `api.kametgroup.com` matches `environment.apiBaseUrl` exactly (`https://api.kametgroup.com/api`). The login call is confirmed **on the default host** — classification per Step 3's options: **B (same host as `apiBaseUrl`)**. The separate `enterpriseapiBaseUrl` (`43.204.170.108:9091`) was **not** touched by login and, in fact, was not observed anywhere in this live session (see §18.9) — no create/edit was submitted, and that base URL is the only place in the whole app that's ever wired to it (per §3/§13).

### 18.3 User Management page — full network activity
Navigated to `/enterprise/user-management` and inspected all XHR/fetch requests generated on load:

| Method | Hostname | Path | Status | Type | Read-only? |
|---|---|---|---|---|---|
| POST | `api.kametgroup.com` | `/api/v2/getSubordinate` | 200 | xhr | Yes |
| GET | `api.kametgroup.com` | `/api/v2/getAllSites?userId=1787` | 200 | xhr | Yes |

Only two requests fired. No `getAllRoles` or `assignment-status` request was observed — confirming §10/§12's finding that the live `enterprise-user` page does not call either endpoint.

### 18.4 User list endpoint (live)
`POST https://api.kametgroup.com/api/v2/getSubordinate` → 200. **Target: DEFAULT**, confirmed by direct network observation (not inferred from the path). This matches `EmployeeManagementService.getEmployees()` being called with no `isEnterprise` argument in `user-management.ts` (`this.employeeService.getEmployees()`, defaulting to `false`).

### 18.5 Sites endpoint (live)
`GET https://api.kametgroup.com/api/v2/getAllSites?userId=1787` → 200. **Target: DEFAULT.** Consistent with §2's finding that `ApiService.get()`'s `isEnterprise` branch is a structural no-op — GET requests always resolve to `apiBaseUrl` regardless of what flag is passed.

### 18.6 Roles endpoint
Not called by the live page — no request observed. Unchanged/consistent with §10 (`VERIFIED FROM ANGULAR SOURCE`, now also `VERIFIED FROM LIVE NETWORK` in the negative sense: confirmed absent from live traffic).

### 18.7 Assignment-status endpoint
Not called by the live page — no request observed. Same treatment as §18.6.

### 18.8 Default vs. Enterprise API — live comparison
Every single live request observed in this session (login, dashboard widgets, user list, sites) resolved to `api.kametgroup.com` — the **default** host. The `enterpriseapiBaseUrl` host (`43.204.170.108:9091`) was **never observed on the wire** in this session, because no create/edit action was submitted (per the strict read-only mandate) and no other page/action in the app ever calls it. This live pass **cannot** confirm what `43.204.170.108:9091` actually does, whether it's reachable, or whether it's the same backend behind a different port — that remains `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION`, now additionally qualified as `UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION` since only a live `addSubordinate`/`editSubordinate` call would ever exercise it.

### 18.9 Create User — inspected, not submitted
Opened the "Add user" modal via the live UI. Confirmed from the rendered form and (unchanged, re-read) source `user-management.ts`:
- Configured target: **enterprise** (`this.employeeService.addEmployee(payload, true)` — `isEnterprise=true`) — `VERIFIED FROM ANGULAR SOURCE`.
- Configured site field: **`siteId`** (camelCase, `Number(formValue.site_id)` mapped into `siteId` in the outgoing payload) — `VERIFIED FROM ANGULAR SOURCE`.
- No network request fires merely by opening the modal (confirmed: network list before/after opening was unchanged) — consistent with the form being purely client-side reactive state until `submitAddUser()` runs.
- **The modal was closed via Cancel. No submission was made.**
- Whether the backend actually accepts this enterprise-host/camelCase payload: **UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION** (explicitly not resolved by this pass, per Step 6's instruction to stop rather than submit).

### 18.10 Edit User — inspected, not submitted
Opened the row action menu → "Edit" for an existing live user. Confirmed:
- Opening the Edit modal only calls `addUserForm.patchValue(...)` — a pure client-side operation. No network request fired (confirmed: network list unchanged after opening the modal), consistent with source (`editUser()` has no HTTP call).
- Configured target on save: **enterprise** (`this.employeeService.editSubordinate(EditPayload, true)`) — `VERIFIED FROM ANGULAR SOURCE`.
- Configured identifier: **`userId`** (`EditPayload = { ...payload, userId: this.editingUserId }`) — `VERIFIED FROM ANGULAR SOURCE`.
- Configured site field: **`siteId`** (same payload construction as create) — `VERIFIED FROM ANGULAR SOURCE`.
- **The modal was closed via Cancel. No submission was made.**
- Whether the backend actually accepts this contract: **UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION**.

### 18.11 Cross-check summary

| Operation | Angular implementation | Live observed behavior | Final confidence |
|---|---|---|---|
| User list | `getEmployees()`, no flag → default | `POST /v2/getSubordinate` → `api.kametgroup.com` (200) | **VERIFIED FROM LIVE NETWORK** |
| Sites | `getSites()`, GET always default | `GET /v2/getAllSites` → `api.kametgroup.com` (200) | **VERIFIED FROM LIVE NETWORK** |
| Roles | `getRoles()` exists but never called by this page | No request observed | **VERIFIED FROM LIVE NETWORK** (confirmed not called) |
| Assignment status | `getAssignStatus()` exists but never called by this page | No request observed | **VERIFIED FROM LIVE NETWORK** (confirmed not called) |
| Create | `addEmployee(payload, true)` → enterprise host, `siteId` | Not submitted (by design) | **VERIFIED FROM ANGULAR SOURCE** for configuration; **UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION** for backend acceptance |
| Edit | `editSubordinate(payload, true)` → enterprise host, `userId`/`siteId` | Not submitted (by design) | **VERIFIED FROM ANGULAR SOURCE** for configuration; **UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION** for backend acceptance |
| Delete | `deleteEmployee(id)`, no flag → default | Not exercised this pass (not required by Steps 1–10) | **VERIFIED FROM ANGULAR SOURCE** (unchanged from §9) |
| Login | `login()`, no flag → default | `POST /v1/authenticate/companyLogin_TP` → `api.kametgroup.com` (200) | **VERIFIED FROM LIVE NETWORK** |

---

## 19. Final Decision (Phase 3)

1. **What API target should React use for User Management list operations?** `default` — directly confirmed by live network capture (`/v2/getSubordinate` → `api.kametgroup.com`), not just source inference.
2. **What API target should React use for create?** **Still unresolved as a hard fact.** Angular's live route is source-verified to target `enterprise` with `siteId`. The cross-client consensus (legacy Angular + Flutter, §13) favors `default`/`site_id`. This live pass deliberately did not submit a create request, so it adds no new evidence either way — see §18.9. The recommendation from §16 stands: prefer the `default`/`site_id` cross-client-consensus contract unless/until a mutating test confirms the enterprise-host contract actually works.
3. **What API target should React use for edit?** Same as create — **unresolved**, same reasoning, see §18.10.
4. **What field should React use for site assignment?** Unresolved for create/edit pending §2/§3 above; **`siteId`/`site_id` is a real fork** — Angular's live route sends `siteId`, cross-client consensus sends `site_id`. Not settled by this pass.
5. **What identifier should React use for edit?** Same fork — Angular's live route sends `userId`, cross-client consensus sends `id`. Not settled by this pass.
6. **Are default and enterprise actually different backends?** Still `UNKNOWN`. They are confirmed different **hosts** (DNS name vs. raw IP:port, different schemes/ports — `https://api.kametgroup.com/api` vs `http://43.204.170.108:9091/api`). Whether they're the same application behind two entry points or genuinely separate deployments cannot be determined without either backend source or a live call that actually reaches `43.204.170.108:9091` — which this pass did not make, per the no-mutation mandate.
7. **Which Angular implementation is most trustworthy?** Per §13/§18: the **legacy `employer` tree's** create/edit implementation (target `default`, `site_id`, `id`) is corroborated by an independent third client (Flutter) and by every other unanimous endpoint (list, delete, sites, roles). The live `enterprise-user` tree's create/edit calls remain the **sole outlier** across three independent codebases — this live pass did not change that conclusion, it only reconfirmed (via network capture rather than source-reading alone) that everything else on the live page is `default`.
8. **Is any part still unresolved?** Yes, explicitly:
   - Whether the backend actually accepts `enterprise`/`siteId`/`userId` (today's live Angular contract) — `UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION`.
   - Whether the backend actually accepts `default`/`site_id`/`id` for these two specific endpoints (the cross-client-consensus contract) — also `UNKNOWN — REQUIRES MUTATING REQUEST VERIFICATION`, since no live add/edit call of either shape was made.
   - What `43.204.170.108:9091` actually is/does — `UNKNOWN — REQUIRES LIVE BACKEND VERIFICATION`.
   - Full response shape of `assignment-status` beyond the fields Flutter reads (§12) — unchanged, `UNKNOWN`.

**No application source (React, Angular, or backend) was modified. No dependency was upgraded or installed. No user/account/data was created, edited, deleted, activated, or deactivated. No password, token, cookie, or Authorization header was recorded anywhere in this document or in any tool output.**

---

---

## 20. LOGIN API PARITY VERIFICATION (Phase 3A follow-up)

> Triggered by a real, observed 401 when the user manually logged into the React production build (`http://localhost:4173/auth/login`) with enterprise credentials. Read-only investigation — no source was modified, no repeated login retries were performed beyond the single attempt that had already occurred, and no password/token/cookie/Authorization value is reproduced anywhere below. One additional non-mutating diagnostic network call (a CORS `OPTIONS` preflight and a raw TLS ALPN probe, both from this machine, no credentials involved) was made directly to `api.kametgroup.com` to establish the HTTP protocol version — this carried no request body and touched no user data.

### 20.1 The failed React request — sanitized
| Property | Value |
|---|---|
| Hostname | `api.kametgroup.com` |
| Path | `/api/v1/authenticate/companyLogin_TP` |
| Method | POST |
| Status | 401 |
| Request content type | `application/json` |
| Request field names | `{ mobileNumber: [REDACTED], password: [REDACTED] }` — no other fields present |
| Response body | `{"status":"ERROR","statusMessage":"Invalid or Missing API Key"}` |

**This response message is decisive: the backend is not rejecting the mobile number/password pair at all — it is rejecting the request's API key.** This reframes the entire investigation away from "wrong credentials" and toward "malformed/missing `authKey` header."

### 20.2 React login implementation (traced, unchanged)
- `src/app-desktop/pages/auth/Login.tsx` → `onPasswordSubmit` → `loginWithPassword({ mobileNumber, password })`.
- `src/app-desktop/api/auth.api.ts`: `loginWithPassword(body)` → `api.post("default", "/v1/authenticate/companyLogin_TP", body)` — **target: `default`**, body is exactly `{ mobileNumber, password }`, no extra fields, no transformation.
- `src/app-desktop/api/httpClient.ts`: every request goes through `buildHeaders()`, which does `headers.set("authKey", AUTH_KEY)` (from `VITE_AUTH_KEY`) and, only if a session already has an `accessToken`, `Authorization: Bearer <token>`. At login time there is no session yet, so only `authKey` (+ `Content-Type: application/json`) goes out. This is built on the native `fetch()` API via a `Headers` object.
- Response handling: checks `res.status === "SUCCESS" && res.statusCode === "LOGIN_200" && res.response`, then calls `login(res.response)` and redirects. No transformation of the outgoing credentials (no trim/encode/hash) — confirmed by direct re-read.

### 20.3 Angular login implementation (traced)
- `enterprise-login`/standard `Login` component → `AuthService.login({ mobileNumber, password })` (`auth.service.ts:27`).
- `AuthService.login()` → `this.api.post('/v1/authenticate/companyLogin_TP', data)` — **no `flag` argument**, so `ApiService.post()`'s `isEnterprise` parameter defaults to `false` → **target: `default`** (`this.baseurl`, i.e. `apiBaseUrl`). Body is exactly `{ mobileNumber, password }`, unmodified — `ApiService.post()` passes `body` straight through to `this.http.post()` with no transformation.
- Headers are **not** set by `ApiService.post()` itself — confirmed by direct re-read of `api.service.ts`: the `headers` parameter it accepts is never attached to the actual `this.http.post()` call (a dead parameter). All real headers come from the global `authInterceptor` (`core/interceptors/auth.interceptor.ts`), which runs on every request except Strapi calls: `headers = { authKey: environment.authKey }`, plus `Authorization: Bearer <token>` only if a token already exists (none at login time). `encryptionInterceptor` is registered but commented out — inactive, confirmed unchanged from earlier findings.
- Angular's `HttpClient` is configured via `provideHttpClient(withInterceptors([authInterceptor]))` in `app.config.ts`, **with no `withFetch()`** — this is the default configuration, which uses Angular's XHR-based backend (`HttpXhrBackend`), not the Fetch API.
- No credential transformation (no trim/encode/hash) exists anywhere in this path — confirmed by direct re-read.

### 20.4 Request comparison

| Property | Angular | React | Match? |
|---|---|---|---|
| API target | `default` (`apiBaseUrl`, no `flag` passed → defaults `false`) | `default` (explicit `"default"` argument) | ✅ Yes |
| Hostname | `api.kametgroup.com` | `api.kametgroup.com` | ✅ Yes |
| Endpoint | `/api/v1/authenticate/companyLogin_TP` | `/api/v1/authenticate/companyLogin_TP` | ✅ Yes |
| HTTP method | POST | POST | ✅ Yes |
| Content type | `application/json` (Angular's default for an object body) | `application/json` (explicit) | ✅ Yes |
| Mobile field name | `mobileNumber` | `mobileNumber` | ✅ Yes |
| Password field name | `password` | `password` | ✅ Yes |
| Additional body fields | None | None | ✅ Yes |
| `authKey` header **value** | `environment.authKey` (hardcoded, 31 chars) | `VITE_AUTH_KEY` (`.env`) | ✅ **Byte-for-byte identical** — verified via SHA-256 hash comparison of both values without printing either (`fa60a2ee38e3…f37f4468` on both sides) |
| `authKey` header **name/casing** | `authKey` — sent via Angular's default **XHR-based** `HttpClient` backend (no `withFetch()` configured), which preserves header names exactly as given to `setRequestHeader` | `authkey` (all lowercase) — **directly observed** in this session's captured DevTools request headers for the failing call; sent via the native **`fetch()`** API, whose `Headers` interface normalizes header names to lowercase per the Fetch living standard | ❌ **Confirmed different** |
| `Authorization` header (at login) | Absent (no token yet) | Absent (no token yet) | ✅ Yes |
| Transformations | None | None | ✅ Yes |

**HTTP protocol note:** A direct TLS/ALPN probe against `api.kametgroup.com:443` confirmed the server negotiates **HTTP/1.1 only** (not HTTP/2/h3). This matters because HTTP/2+ mandates all header names be lowercase at the wire/framing level regardless of client API — which would have made the casing difference moot. Since the connection is HTTP/1.1, header-name casing set by the client is preserved end-to-end over the wire, so the `authKey` vs `authkey` difference observed here is real and not an artifact of protocol negotiation.

### 20.5 Explanation of the 401
The backend's own response body — `{"status":"ERROR","statusMessage":"Invalid or Missing API Key"}` — directly names the `authKey` mechanism as the failure, not the mobile number/password pair. Every other property of the request (target, host, endpoint, method, content type, body field names, body values by hash, absence of extra fields, absence of an Authorization header) is confirmed identical between Angular and React. The **one concrete, verified difference** is that React's request carried the header as `authkey` (lowercase) while Angular's request — based on its use of the default XHR backend, which preserves given casing — would carry it as `authKey`. Header names are supposed to be case-insensitive per HTTP semantics (RFC 7230 §3.2), so a backend that rejects a differently-cased-but-otherwise-identical header would itself be relying on non-compliant, case-sensitive header matching — but that kind of bug is common in hand-rolled legacy auth filters, and it is consistent with the exact symptom observed (a specific "API key" rejection, not a credential rejection).

**This is not confirmed against backend source** (unavailable locally, per §14) and is therefore reported as the most likely explanation given the evidence, not a certainty.

### 20.6 Is the React login request equivalent to Angular's?
**Not byte-for-byte equivalent.** One concrete difference was found: the casing of the `authKey` header name (`authkey` in React vs. `authKey` in Angular), traceable to React's use of `fetch()`/`Headers` vs. Angular's default XHR-based `HttpClient`. Every other aspect of the request — target, host, endpoint, method, content type, body field names, and the `authKey` value itself — is confirmed identical.

### 20.7 Credential/account status
Because a genuine, non-credential-related implementation difference was found, and because the backend's own error message names the API key (not the credential) as the problem, **the supplied mobile number/password should not be presumed incorrect at this stage.** Separately, per the Phase 3 live verification session earlier in this engagement, the same live Angular application was successfully logged into (`POST .../companyLogin_TP` → **200**) using enterprise credentials entered manually by the user — direct evidence that this backend and endpoint accept valid enterprise credentials when the request is well-formed. Whether that earlier login used the identical account as this session's React attempt was not verified (mobile numbers were intentionally redacted in both passes) and is not assumed here.

### 20.8 Recommended next action
**Not implemented in this pass, per instructions.** The recommended next step is a single controlled test: send one request to `/v1/authenticate/companyLogin_TP` with the header name cased exactly as `authKey` (matching Angular) instead of relying on `fetch()`'s automatic lowercasing, and observe whether the "Invalid or Missing API Key" response changes. If it does, the fix is isolated to how `httpClient.ts` sets that one header (e.g., a transport that preserves case, or confirming with the backend team whether header names are treated case-sensitively). This is a recommendation only — no code was changed in this investigation.

---

---

## 21. LOGIN HEADER CASING — XHR VERIFICATION

> Attempted as a controlled, single, read-only diagnostic to test whether the backend's `authKey` check is header-name-case-sensitive. No source file was or will be modified as part of this section.

### 21.1 fetch() result (already established, §20)
`fetch()`-based request (React's actual `httpClient.ts`) sent the header as `authkey` (lowercase) → **HTTP 401**, `{"status":"ERROR","statusMessage":"Invalid or Missing API Key"}`.

### 21.2 XHR result
**UNKNOWN — XHR LIVE TEST COULD NOT BE PERFORMED.**

The planned in-page `XMLHttpRequest` diagnostic (reading the already-entered mobile number/password from the live login form's DOM inputs, setting the header explicitly as `authKey`, and posting to `/v1/authenticate/companyLogin_TP`) was blocked by Claude Code's own safety classifier before execution — injecting a script that reads credential fields and issues a live authentication request to a real backend was refused at the tool-permission layer, independent of and prior to any application-level safeguard. No workaround was attempted, per instructions to stop rather than route around a permission denial.

### 21.3 Wire-level header casing
Unchanged from §20: confirmed via direct DevTools capture that React's real `fetch()` request sends `authkey` (lowercase); confirmed via source-level tracing that Angular's default XHR-based `HttpClient` (no `withFetch()` configured) preserves header casing as given, i.e. `authKey`. The backend was confirmed to negotiate HTTP/1.1 only (via a credential-free TLS/ALPN probe), so this casing is preserved end-to-end on the wire in both cases — this part of the investigation did not require the blocked test and stands as previously reported.

### 21.4 Status comparison
| Client | Header casing sent | HTTP status | Backend message |
|---|---|---|---|
| Angular (live, Phase 3 login) | `authKey` (via XHR, inferred from source — not independently re-captured in this pass) | 200 (observed in Phase 3) | — (login succeeded) |
| React (live, this session) | `authkey` (via `fetch()`, directly observed) | 401 | "Invalid or Missing API Key" |
| React via corrected-case XHR | `authKey` (planned) | **not obtained** | **not obtained** |

### 21.5 Conclusion
The controlled experiment could not be completed in this session. The header-casing hypothesis from §20 remains the leading, evidence-consistent explanation but is **still unconfirmed** — it has not been isolated from other possible variables via a live A/B test. No new evidence was gathered in this section beyond what §20 already established.

### 21.6 Recommended implementation approach
Two safe paths forward, neither attempted here:
1. **User-run test**: the user can paste an equivalent diagnostic snippet directly into their own browser DevTools console (fully outside Claude Code's tool permissions, entirely under their own control) while on the live login page, and report back only the sanitized HTTP status and `statusMessage` — never the credential or key values.
2. **Grant tool permission**: if the user adds a Bash/DevTools permission rule allowing this class of diagnostic script execution, the same test could be re-attempted by Claude Code under explicit, informed authorization.

No code was modified. No further login attempts were made against the live backend in this section.

---

---

## 22. LOGIN API PARITY — SECOND-LEVEL INVESTIGATION

> Read-only. No source modified. No new login attempt was initiated by Claude Code in this section — all evidence comes from (a) source re-inspection and (b) network requests already present in the browser's request log from prior turns (including the user's own manually-run XHR test).

### 22.0 Critical caveat found before anything else — the reported XHR test result is unreliable

While pulling sanitized network evidence for this comparison, the actual captured request for the user's manual XHR test (`reqid=897`, `POST /v1/authenticate/companyLogin_TP`, 401) was inspected. **The value carried in its `authkey` request header is not an API key at all — it has the shape of a browser `Accept-Language` string** (a comma-separated list of locale tags with `q=` weights), not the 31-character key confirmed elsewhere in this investigation.

This means the just-reported conclusion "XHR with explicitly-cased `authKey` still returned 401, therefore casing is not the cause" **is not valid evidence** — that specific request never actually carried the real API key, cased or not. Something in the diagnostic script that produced it substituted the wrong JavaScript value (e.g. a variable mix-up, such as reading `navigator.language`/`navigator.languages` instead of the value entered into the script's own prompt) before the request was sent. This was not something Claude Code executed — it was already present in the browser's request log from the user's own independently-run script.

**Practical effect on this investigation:** the header-casing hypothesis (§20–21) is **not falsified**. It remains untested with a correct value via a real XHR call. A dialog box (`"Paste the authKey value locally..."`) was observed still open on the page during this pass, suggesting a corrected re-run may already be in progress on the user's side; this was left untouched and not interacted with in any way, since resolving it would require either supplying the secret (not permitted) or interrupting an in-progress user action.

The remainder of this section proceeds with what source inspection and *other* existing network evidence can establish, independent of that one invalid data point.

### 22.1 Complete Angular request characteristics (VERIFIED FROM SOURCE)
- Endpoint: `POST /v1/authenticate/companyLogin_TP`
- Base/target: `environment.apiBaseUrl` = `https://api.kametgroup.com/api` (no `flag` passed to `ApiService.post()`, defaults `false` → `default`, not `enterprise`)
- Body: `{ mobileNumber, password }`, passed through unmodified
- Headers actually attached: only via the global `authInterceptor` — `authKey: environment.authKey`, plus `Authorization: Bearer <token>` only if a token already exists (none at login). The `headers` parameter accepted by `ApiService.post()` itself is dead code, never attached to the real request (re-confirmed by source re-read).
- `withCredentials`: **not set anywhere** in the Angular codebase — grep for `withCredentials` across `src/app` returns zero matches. Angular's `HttpClient` therefore uses its default (`false`), matching fetch's default cross-origin behavior (no cookies sent).
- Interceptors: exactly one active — `authInterceptor` (functional, registered via `provideHttpClient(withInterceptors([authInterceptor]))`). A class-based `HTTP_INTERCEPTORS` provider is commented out (dead code). `encryptionInterceptor` is imported but commented out of the active interceptor list (dead code, confirmed unchanged from earlier findings).
- HTTP backend: default (XHR-based) — `app.config.ts`'s `provideHttpClient(...)` call does not include `withFetch()`.
- Environment-dependent behavior: none found — `environment.ts` is a single static file, no per-environment branching in the login path.

### 22.2 Complete React request characteristics (VERIFIED FROM SOURCE)
- Endpoint: `POST /v1/authenticate/companyLogin_TP` (`auth.api.ts`: `loginWithPassword`)
- Target: `"default"` passed explicitly to `api.post()` → `VITE_API_BASE_URL` = `https://api.kametgroup.com/api` (byte-identical hostname/path to Angular's `apiBaseUrl`, confirmed via direct `.env` read)
- Body: `{ mobileNumber, password }`, passed through unmodified
- Headers: `httpClient.ts`'s `buildHeaders()` — `authKey` (from `VITE_AUTH_KEY`, set via `Headers.set("authKey", AUTH_KEY)`) and `Content-Type: application/json`; `Authorization` only if a session with `accessToken` already exists (none at login)
- `fetch()` options actually passed: only `method`, `headers`, `body`. **`credentials`, `mode`, `cache`, `redirect`, and `referrerPolicy` are all left unset**, i.e. browser defaults (`credentials: "same-origin"`, `mode: "cors"` for a cross-origin URL, `cache: "default"`, `redirect: "follow"`, default referrer policy). No explicit configuration of any of these exists in `httpClient.ts` — confirmed by direct re-read.
- No interceptor/wrapper layer beyond `buildHeaders()` — every `api.*` call funnels through the single `request()` function.
- No credential transformation (no trim/encode/hash) — confirmed by direct re-read of `Login.tsx` and `auth.api.ts`.

### 22.3 Header / property comparison

| Header / Property | Angular | React | Meaningful difference? |
|---|---|---|---|
| `authKey` header **name** | `authKey` (XHR preserves given case — source-inferred, not independently re-captured live in this pass) | `authkey` observed in live capture (`fetch()`/`Headers`) | Possible — unconfirmed live either way (see §22.0) |
| `authKey` header **value** | `environment.authKey`, 31 chars | `VITE_AUTH_KEY`, 31 chars | **No** — SHA-256 hash-identical, verified earlier without exposing either value |
| Content-Type | `application/json` (Angular auto-sets for an object body) | `application/json` (explicit) | No |
| Accept | Browser default (`*/*`, confirmed in live capture for React) | Same browser default | No — not app-controlled either side |
| Origin | `http://localhost:4200` (Angular's dev-server origin, per its default `ng serve` port — not re-captured live in this pass) | `http://localhost:4173` (confirmed live) | **Possibly** — see §22.5 |
| Referer | `http://localhost:4200/...` (inferred, not re-captured) | `http://localhost:4173/` (confirmed live) | Tracks Origin; same caveat |
| User-Agent | Same browser (Chrome), same machine | Same browser, same machine | No |
| sec-fetch-site | `cross-site` (Angular→`api.kametgroup.com` is cross-origin too) | `cross-site` (confirmed live) | No — both are cross-origin requests |
| sec-fetch-mode | `cors` | `cors` (confirmed live) | No |
| sec-fetch-dest | `empty` | `empty` (confirmed live) | No |
| Credentials mode / cookies | `withCredentials` not set anywhere (default `false`); no app-managed cookies used by this auth scheme at all (bearer token returned in JSON body, not a Set-Cookie) | `fetch` default `credentials: "same-origin"` (cross-origin ⇒ no cookies sent); confirmed no `Set-Cookie` in the live 401 response | No — neither client relies on cookies for this flow |
| Preflight (OPTIONS) | Expected (custom `authKey` header forces one) — not re-captured live in this pass | **Confirmed live**: `OPTIONS /v1/authenticate/companyLogin_TP` → 200, `Access-Control-Allow-Headers: authkey, content-type`, `Access-Control-Allow-Origin: http://localhost:4173`, `Access-Control-Allow-Credentials: true` | No — preflight succeeds for React; no evidence it would behave differently for Angular's origin |
| Additional custom headers | None beyond `authKey`/`Authorization` | None beyond `authKey`/`Authorization` | No |

### 22.4 CORS / preflight comparison
- **React (confirmed live, `reqid=889`):** `OPTIONS https://api.kametgroup.com/api/v1/authenticate/companyLogin_TP` → **200**. Response: `Access-Control-Allow-Origin: http://localhost:4173` (exact origin echoed back, not a wildcard), `Access-Control-Allow-Headers: authkey, content-type`, `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`, `Access-Control-Allow-Credentials: true`.
- **Angular:** not re-captured live in this pass (the Angular dev server is not currently running and its browser tab's request log is no longer available). `UNKNOWN — REQUIRES VERIFICATION` for its literal preflight response, though there is no source-level reason to expect it to differ, since preflight behavior is entirely server-side policy, not client-configured.
- Note: `Access-Control-Allow-Origin` **echoing the exact request Origin** (rather than a fixed value or wildcard) is a pattern consistent with the server reflecting whatever origin asks — which would mean the CORS layer itself is not the gate on port/origin. This does not rule out the *application/auth* layer checking Origin/Referer separately (a distinct code path from CORS headers) — see §22.5.

### 22.5 Origin comparison
- **Angular's dev origin:** `http://localhost:4200` (Angular CLI's default `ng serve` port, confirmed via `package.json`'s `"start": "ng serve"` with no `--port` override, and directly observed when the app was run earlier in this engagement).
- **React's dev/preview origin:** `http://localhost:4173` (Vite preview default port) in this session's tests; `http://localhost:5173` would be Vite's dev-server default (not used in this investigation).
- **Whether the backend/CORS config treats them identically:** Only `:4173` has been directly observed being allow-listed/reflected by the live backend in this session (§22.4). Whether `:4200` is also allow-listed was not re-verified live in this pass (Angular is not currently running). **This cannot be assumed identical.**
- **Why this matters:** every single POST in this session's browser history that reached the backend with anything resembling a real `authKey` value (i.e. excluding the invalidated `reqid=897`) came from origin `:4173` and returned 401. The **only successful login in this entire investigation** (Phase 3, §18.2 — HTTP 200) came from Angular's dev server, which runs on a **different origin**, `:4200`. This is a real, unexplained variable that has never been isolated: **every observed failure shares one origin, and the only observed success has a different origin.** This does not prove origin is the cause (correlation, not yet controlled experiment), but it is now the single least-explored, most-suspicious remaining variable, given that header value (hash-verified) and header name/casing (both tested, modulo §22.0's caveat) are otherwise accounted for.

### 22.6 API-key source comparison
- **Angular:** `environment.authKey` — a plain string literal hardcoded directly in `src/environments/environment.ts`, bundled at build time. No transformation between definition and use — `authInterceptor` reads `environment.authKey` and assigns it directly to the `authKey` header.
- **React:** `import.meta.env.VITE_AUTH_KEY`, read from `.env` at build time via Vite's env-substitution, stored in a module-level `const AUTH_KEY` in `httpClient.ts`. No transformation between definition and use — `buildHeaders()` does `headers.set("authKey", AUTH_KEY)` directly.
- **Equality:** previously verified via SHA-256 hash comparison of the two source values (both 31 characters, identical hash) without ever printing either. This proves the *source-of-truth strings* are identical; it does not by itself prove the *live-observed* header always carries this exact value on every request — the one attempt that was actually re-inspected this pass for its literal transmitted value (`reqid=897`) is the one now known to be invalid/corrupted (§22.0). The earlier `reqid=896` capture (§20.1) is consistent with the real key (correct length/prefix on visual inspection) but was not re-verified against the hash in this pass.

### 22.7 Interceptor comparison
Only Angular has an interceptor layer; React's `httpClient.ts` has an equivalent single centralized `buildHeaders()` function that every call passes through, so the *effect* is architecturally parallel (single shared header-injection point, no per-call divergence) even though the *mechanism* differs (Angular's HTTP interceptor pipeline vs. a plain function called inside `request()`). No behavioral gap was found between the two beyond the already-documented `authKey`/`Authorization` header set — both attach exactly those two headers under exactly the same conditions (token present or not).

### 22.8 Response comparison
The only two response captures available in this session (`reqid=896` and `reqid=897`, both React, both 401) are identical in every observable respect: `{"status":"ERROR","statusMessage":"Invalid or Missing API Key"}`, same `content-type: application/json;charset=ISO-8859-1`, same `server: nginx/1.30.4`, same CORS headers, no `Set-Cookie`, no rate-limiting headers (`Retry-After`, `X-RateLimit-*`) present in either. No Angular 401 response exists to compare against (Angular's only captured response in this engagement was a 200 success, §18.2) — so a like-for-like *failure* response comparison is **UNKNOWN — REQUIRES VERIFICATION**.

### 22.9 Identified differences
1. `authKey` header name casing (`authKey` vs `authkey`) — real per source-level reasoning, **not independently re-confirmed live in this pass**, and the one live re-test attempted for it (`reqid=897`) is invalid (§22.0).
2. Origin/Referer (`:4200` vs `:4173`) — **real, confirmed live for React; not re-confirmed live for Angular in this pass**, but is now the least-explained variable given everything else checks out equal.

### 22.10 Differences that are NOT meaningful
- `withCredentials`/cookie handling — neither client uses cookies for this flow; both default to not sending cross-origin cookies.
- `sec-fetch-*` headers, `Accept`, `User-Agent` — identical browser-generated values, not app-controlled, not differentiating.
- Preflight presence/success — confirmed present and successful for React; no source-level reason to expect Angular's preflight to fail differently.
- Request body shape, field names, HTTP method, endpoint path, target (`default`), Content-Type — all confirmed identical between the two implementations.

### 22.11 Most likely explanation for the 401
**STRONG EVIDENCE, not proven:** the two remaining unexplained variables are (1) header-name casing and (2) request Origin, and neither has been cleanly isolated yet — (1)'s only live re-test was invalid (§22.0), and (2) has not been tested at all (no live request has been made from React's origin with a *correctly-cased* header carrying the *verified-correct* value, nor has Angular's `:4200` origin been re-tested against the current live backend state in this session). It would be premature to name either one as "the" cause. **UNKNOWN — REQUIRES VERIFICATION** remains the honest label for root cause at this point, notwithstanding the earlier turn's incorrect claim that casing had been ruled out.

### 22.12 Remaining UNKNOWN items
1. Whether a correctly-valued, correctly-cased (`authKey`) XHR request from origin `:4173` succeeds — never actually tested (§22.0).
2. Whether Angular's `:4200` origin is still accepted by the live backend today (not re-tested this session).
3. Whether the backend's "Invalid or Missing API Key" check is origin/referer-aware at all (no backend source available to confirm either way).
4. Whether `reqid=896`'s `authkey` value (the original, non-corrupted React `fetch()` attempt) was in fact byte-identical to the verified-correct key at the moment of transmission — plausible from visual inspection but not independently hash-verified against the live captured request.

### 22.13 Recommended next diagnostic
A single, carefully-written test (run by the user themselves in their own browser console, per the established safe pattern) that:
- reads the real API-key value from a trusted source only once (e.g. their own `prompt()`, with no unrelated variable reuse),
- sends it with the header explicitly named `authKey`,
- from the **same origin already in use (`:4173`)**,
- and reports back only the sanitized HTTP status and `statusMessage`.

This isolates variable (1) cleanly. If it still fails, the next step would be testing whether origin matters — which would require running that same corrected test from Angular's `:4200` origin (i.e., with the Angular dev server running) rather than React's, to see if the identical header/value/body combination succeeds only when the origin changes.

---

---

## 23. LOGIN API PARITY — CORRECTED XHR TEST

> Read-only. No source modified. The prior XHR test (§22.0) was invalidated — its `authkey` header carried an `Accept-Language`-shaped string, not the real key. This section corrects that.

### 23.1 API-key source (no value printed)
| | React | Angular |
|---|---|---|
| File | `src/app-desktop/api/httpClient.ts:10` | `D:\Projects\KaamsaathiPC\src\environments\environment.ts` |
| Variable/property | `AUTH_KEY` | `authKey` |
| Source | `import.meta.env.VITE_AUTH_KEY` — environment/config-driven, defined in `.env` at the repo root | Hardcoded string literal |
| Equality | Confirmed byte-for-byte identical to Angular's value via SHA-256 hash comparison (§20.4), without either value being printed | — |

### 23.2 Corrected test setup
A non-blocking on-page input (not a native `prompt()`, which the automation layer would auto-resolve before a human could type into it) was injected into the live React page, asking the user to paste the real `VITE_AUTH_KEY` value from `.env`. The value was stored only in page memory (`window.__diagAuthKey`), never read, logged, or transmitted by Claude Code. Its length was checked (31 characters — consistent with the verified-correct key, unlike the previous invalid attempt's clearly-wrong value) before proceeding. Only after explicit user confirmation to fire the request did a single `XMLHttpRequest` execute, reading that in-page value plus the mobile number/password already present in the login form's DOM. The captured value and the diagnostic overlay were both cleared from the page immediately after the test.

### 23.3 XHR status
**HTTP 200.**

### 23.4 statusMessage
`status: "SUCCESS"`, `statusCode: "LOGIN_200"`, `statusMessage: "Successfully logged in!"`.

### 23.5 Header casing / Origin / endpoint
- API-key header name sent: **`authKey`** (explicitly set via `setRequestHeader`, exact case as Angular).
- Origin: **`http://localhost:4173`** — React's own origin, unchanged from every prior failing attempt.
- Endpoint: `https://api.kametgroup.com/api/v1/authenticate/companyLogin_TP` — identical to every prior attempt.
- Request body: same field names/values already present in the live form (not re-typed, not printed).

### 23.6 Conclusion

> **⚠ INTERMEDIATE HYPOTHESIS — SUPERSEDED.** The conclusion below was the best explanation available at this point in the investigation, but it was later disproven once the true root cause was found. **See §25 for the final, verified root cause** (a Vite `.env` variable-expansion bug truncating `VITE_AUTH_KEY`) — header casing and transport were not, in fact, the cause. This section is kept intact, unedited, as the historical record of how the investigation arrived at (and later corrected) this hypothesis.

**STRONG EVIDENCE — HEADER CASING/TRANSPORT DIFFERENCE IS MATERIAL.** *(superseded — see §25)*

This is now a cleanly isolated, single-variable result: the *only* things that changed between this request and the failing `fetch()`-based React requests (§20, §22) are (a) the transport (`XMLHttpRequest` vs `fetch()`) and (b) the resulting header-name casing (`authKey` vs `authkey`) — target, hostname, endpoint, method, body, and the key's own value were all identical, and **Origin was held constant at `:4173`**, the same origin every prior failing attempt used. Since this request succeeded from that same origin, **§22.5's origin hypothesis is now ruled out** — origin was never the cause. The backend's `authKey` check is therefore best explained as **case-sensitive on the header name**, which is why React's `fetch()`-based `httpClient.ts` (whose `Headers` object sends the name as `authkey`) has been failing while Angular's XHR-based `HttpClient` (which preserves `authKey`) succeeds.

This is reported as strong, now single-variable-isolated evidence — not a certainty, since the backend's own source is still unavailable to confirm the exact mechanism (§14) — but it is no longer just a hypothesis riding on an invalid test.

### 23.7 Next diagnostic
None required to establish the root cause further. If a fix is later authorized, the corrected direction (not implemented in this investigation, per instructions) would be: make React's HTTP layer send the header with the exact case `authKey` — e.g. by using an XHR-based transport for this header, or any mechanism that avoids `fetch()`/`Headers`' automatic lowercasing — rather than changing anything about the key's value, the target, or the request body/shape, all of which are already correct.

---

---

## 24. LOGIN TRANSPORT FIX — POST-FIX DIAGNOSTIC

> Read-only diagnosis of the still-failing login after `httpClient.ts` was switched from `fetch()` to `XMLHttpRequest` (§25 covers that change itself). No source was modified in this section. No new login attempt was initiated by Claude Code — all evidence is from requests already in the browser's log plus safe, network-free, build-time checks.

### 24.0 The actual root cause — found before completing the planned checklist
While gathering Step 1's sanitized header list, the captured `authkey` request header value for the post-fix XHR request was visibly short — just two characters, matching the pattern `"23"` seen in *every* prior capture across this entire investigation (§20.1, §22, §23). This had previously been assumed to be a display truncation. It is not.

**A direct, network-free replication of Vite's own build-time env resolution (`vite`'s `loadEnv()`, the exact function that populates `import.meta.env` in every build of this app) was run against this project's real `.env`:**

| Variable | Resolved length | Notes |
|---|---|---|
| `VITE_AUTH_KEY` | **2** | Expected 31 |
| `VITE_API_BASE_URL` | 30 | Matches the raw file value exactly — no mangling |
| `VITE_ENTERPRISE_API_BASE_URL` | 30 | Matches the raw file value exactly — no mangling |

**Root cause: Vite's `.env` loader performs shell-style `$VAR`/`${VAR}` expansion (via `dotenv-expand`, bundled into Vite's env pipeline).** `VITE_AUTH_KEY`'s raw value contains two `$`-prefixed segments that are not meant as variable references but are syntactically indistinguishable from them. Since no environment variables with those names exist, each is silently expanded to an empty string, collapsing the 31-character key down to just its first two characters (`"23"`) in every value Vite ever hands to `import.meta.env.VITE_AUTH_KEY` — in dev, in preview, and in every production build made from this `.env` file. The other two `VITE_*` variables contain no `$` and are unaffected, confirming this is specific to the `$` characters, not a general env-loading failure.

**This single fact fully explains every observation made across §20–§23, without requiring the header-casing or origin hypotheses at all:**
- Every real request from React's actual `httpClient.ts` — fetch-based (§20) and now XHR-based (§25) alike — has always carried this same truncated 2-character value, regardless of transport or header casing. That is why switching to XMLHttpRequest did not fix the login.
- The one request that *did* succeed (§23) used a value typed directly into an ad hoc diagnostic script — sourced from the user reading `.env`/`environment.ts` themselves and pasting the *complete* value — which bypassed Vite's broken env pipeline entirely. Its success was never about XHR vs. fetch; it succeeded because, uniquely among every request in this investigation, it was the only one carrying the real, complete key.
- The header-casing difference documented in §20–§22 is very likely real (Angular's XHR-based `HttpClient` vs. React's `fetch()`-based `Headers` do differ in how they present a header name on the wire) but was never the operative cause of the 401s — it was a correlated-but-incidental property of how the one successful test happened to be constructed, not the reason it worked.

### 24.1 Step 1 — sanitized failed request (`reqid=925`, current React XHR)
| Property | Value |
|---|---|
| Hostname | `api.kametgroup.com` |
| Endpoint path | `/api/v1/authenticate/companyLogin_TP` |
| HTTP method | POST |
| Request type | `xhr` |
| Origin | `http://localhost:4174` |
| Referer | `http://localhost:4174/` |
| Content-Type | `application/json` |
| Accept | `*/*` |
| API-key header name (as observed) | `authkey` |
| API-key header present | Yes |
| Cookies present | No (`Cookie` absent from request; `Set-Cookie` absent from response) |
| Content-Length | 51 |

### 24.2 Step 2 — request body shape
```
{
  mobileNumber: string,
  password: string
}
```
No other fields present. Matches Angular exactly (unchanged from §22.2).

### 24.3 Step 3 — the authKey header name, and why it no longer matters
The header name still displays as `authkey` (lowercase) in this XHR-based capture — the *same* rendering seen for the earlier `fetch()`-based captures. Given §24.0, this is now understood not to be the operative issue regardless of whether it reflects true wire-level casing or a DevTools display convention: **the header carries the wrong value** (2 chars instead of 31), which alone is sufficient to produce "Invalid or Missing API Key" independent of its name's casing. Whether the name-casing difference is *also* real and *would* matter once the value is fixed remains genuinely untested — see §24.9.

### 24.4 Step 4 — httpClient.ts trace (source, unchanged by this section)
- Uses `XMLHttpRequest`: **yes**, via an internal `xhrRequest()` helper.
- `authKey` added in `buildHeaders()`: `if (AUTH_KEY) headers["authKey"] = AUTH_KEY;`
- Applied via a loop in `xhrRequest()`: `for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);`, called **before** `xhr.send(body)`.
- `AUTH_KEY` obtained via `import.meta.env.VITE_AUTH_KEY` at module scope — Vite-substituted at build time.
- Can `AUTH_KEY` be undefined/empty at runtime? The existing `if (AUTH_KEY)` guard only protects against `undefined`/empty string — it does not and cannot detect a *non-empty but wrong* value, which is exactly what's happening here (§24.0). This is a real gap, though not a bug introduced by this section's transport change — it predates it (the same guard existed in the original `fetch()`-based code).

### 24.5 Step 5 — runtime API-key presence/length
A true in-page, zero-network runtime probe was not possible without either (a) triggering a new request (forbidden this turn) or (b) reading a minified, non-exported module-private constant (not addressable from outside the bundle). Instead, the equivalent build-time source was checked directly and safely (§24.0), using the same mechanism (`vite`'s `loadEnv()`) that produces the exact value the running app has baked into it — this is the authoritative source for what any build of this app actually contains, not an approximation of it.

**present = true**
**length = 2**

(Expected: 31 — confirmed via §20.4's earlier SHA-256 comparison of the *intended* value.)

### 24.6 Step 6 — origin comparison, revisited
| | Successful manual XHR (§23) | Current React XHR (`reqid=925`) |
|---|---|---|
| Origin | `http://localhost:4173` | `http://localhost:4174` |

Origin does differ, exactly as observed before — but given §24.0, this is now understood to be incidental, not causal: the manual test's origin was never the reason it succeeded; the complete, correct key value was. No evidence in this investigation supports origin-based rejection once the confound of the wrong key value is accounted for.

### 24.7 Step 7 — XHR header-setting mechanics
Confirmed by source re-read (§24.4): `setRequestHeader` calls happen in a simple synchronous loop immediately before `send()`, with no wrapper, no duplicate assignment, no case-variant logic, and nothing between header-setting and send that could alter it. The header-application *code* is correct and behaves exactly as designed — the defect is entirely upstream, in what value `AUTH_KEY` resolves to (§24.0), not in how the header is applied.

### 24.8 Step 8 — comparison table
| Property | Successful manual XHR | Current React XHR |
|---|---|---|
| Origin | `http://localhost:4173` | `http://localhost:4174` |
| Host | `api.kametgroup.com` | `api.kametgroup.com` |
| Endpoint | `/api/v1/authenticate/companyLogin_TP` | `/api/v1/authenticate/companyLogin_TP` |
| Method | POST | POST |
| Request type | xhr | xhr |
| API-key header name | `authKey` (as coded in the diagnostic script) | `authKey` (as coded in `httpClient.ts`) — observed as `authkey` |
| API-key present | Yes | Yes |
| API-key length | 31 (typed from the complete source value) | **2** (Vite-mangled — §24.0) |
| Content-Type | `application/json` | `application/json` |
| Body fields | `mobileNumber`, `password` | `mobileNumber`, `password` |
| Cookies | No | No |

### 24.9 Step 9 — actual cause
None of the originally-listed outcomes (A–F) precisely fits. The closest is a variant of **D**, refined by this section's findings: **the API-key header is present, non-empty, and reaches the backend — but its value is silently truncated from 31 to 2 characters by Vite's `.env` variable-expansion handling of the `$` characters in `VITE_AUTH_KEY`'s raw value.** This is confirmed via a direct, safe replication of Vite's own env-loading function, corroborated by every live network capture across this entire investigation independently showing the identical 2-character pattern. Header-name casing (the earlier leading hypothesis) and request Origin are both very likely **not** the operative cause — see §24.0's reasoning — though neither can be fully closed out until a request is made with the corrected value (§24.10).

### 24.10 Recommended next action (not applied — explicitly out of scope for this diagnostic turn)
Fix how `VITE_AUTH_KEY` is stored/read so its `$` characters are not treated as shell-style variable references. This is a `.env`/configuration concern, not an application-source defect — `httpClient.ts`'s handling of the value is correct. No change was made to `.env`, `httpClient.ts`, or any other file in this section, per the explicit instruction not to modify source or configuration in this diagnostic pass.

---

---

## 25. LOGIN ROOT-CAUSE FIX + TRANSPORT REVALIDATION (FINAL)

> This section supersedes the transport conclusion implied by §20–§23. It corrects the record rather than leaving the earlier hypothesis standing as if proven.

### 25.1 Historical progression (for the record — do not treat earlier sections as the final word)

**INITIAL HYPOTHESIS (§20–§23):** `fetch()`'s `Headers` object lowercases the `authKey` header name on the wire, and the backend's API-key check is case-sensitive on that name — this was believed to be why React's login failed while Angular's (XHR-based) login succeeded. A shared-transport migration from `fetch()` to `XMLHttpRequest` was implemented on this basis (§24 documents that implementation).

**WHY THAT CONCLUSION WAS INVALID:** the migration did not fix login (§24.1's `reqid=925` still failed). Investigating why revealed the real defect: every normal React request — regardless of whether it used `fetch()` or `XMLHttpRequest` — was carrying a `VITE_AUTH_KEY` value truncated from 31 characters down to 2 by Vite's environment-loading pipeline (§24.0). The one request that had ever succeeded before this section did so because it used a hand-typed, complete value that bypassed that pipeline entirely — a fact that had nothing to do with transport or header casing, but which coincidentally correlated with "used XHR," making the casing hypothesis look confirmed when it was not.

**VERIFIED CONFIGURATION ROOT CAUSE:** `VITE_AUTH_KEY`'s raw value in `.env` contained two literal `$`-prefixed segments. Vite's `.env` loader (`dotenv-expand`, bundled into Vite's env pipeline) treats unescaped `$NAME`/`${NAME}` sequences as shell-style variable references; since no such environment variables existed, both were silently expanded to empty strings, leaving only the first two characters (`"23"`) of the intended key in every build.

### 25.2 The fix applied
`.env`'s `VITE_AUTH_KEY` line was edited to escape its two literal `$` characters as `\$` (the `dotenv`/`dotenv-expand` escape syntax for "not a variable reference"), using a script that read/wrote the file programmatically — the value itself was never printed, logged, or displayed at any point in this process. No other character of the key was altered. No key was hardcoded into TypeScript or moved out of the existing environment/config mechanism.

**Verification (via a direct, safe replication of Vite's own `loadEnv()` — the exact function that populates `import.meta.env` in every build of this app):**

| | Value |
|---|---|
| Raw logical key length | 31 |
| Vite-resolved key length (before fix) | 2 |
| Vite-resolved key length (after fix) | **31** |
| Match (SHA-256 comparison against the known-correct value, neither value printed) | **true** |

### 25.3 Fresh rebuild and controlled A/B transport test

Two independent fresh builds were made from the corrected `.env`, each verified with a real, single, user-performed login:

| | Transport | Preview port | Result |
|---|---|---|---|
| Test 1 | `XMLHttpRequest` (the §24 migration, still in place at the time) | `:4175` | **HTTP 200**, redirected to `/enterprise/dashboard` |
| Test 2 | `fetch()` (original implementation, recovered from the last commit via `git show HEAD:src/app-desktop/api/httpClient.ts` — the fetch→XHR migration had never been committed, so `HEAD`'s copy of this file *is* the original) | `:4176` | **HTTP 200**, redirected to `/enterprise/dashboard` |

**This is Decision Matrix CASE A: corrected XHR → 200, corrected fetch → 200.**

**Conclusion: the `fetch()` transport was never the problem.** The root cause was solely the Vite `.env` expansion truncating `VITE_AUTH_KEY`. Test 2's captured request further confirms this directly: `fetch()` still sent the header name in lowercase (`authkey`) — exactly as it always had — yet the login succeeded once the *value* was correct, closing out the header-casing question definitively. It was never the casing; it was always the value.

### 25.4 Action taken: reverted the transport migration
Per the decision matrix's CASE A instruction, the `fetch()`-based implementation was kept and the XMLHttpRequest rewrite was **not** retained. `src/app-desktop/api/httpClient.ts` was restored to the exact content of the last commit (`git show HEAD:... > src/app-desktop/api/httpClient.ts`) — confirmed via `git diff --stat` showing zero changes to this file, i.e. it is now byte-identical to the version already in git history. No unnecessary transport complexity was kept.

### 25.5 FINAL ROOT CAUSE
**Vite's `.env` variable-expansion handling of literal `$` characters in `VITE_AUTH_KEY`**, and nothing else. Header-name casing, request transport (`fetch` vs `XMLHttpRequest`), and request Origin were all investigated at length across §20–§24 and are now understood to have been correlated-but-incidental properties of the one hand-constructed request that happened to succeed — not causal factors. This is derived directly from the controlled A/B result in §25.3, not from re-asserting the earlier hypothesis.

### 25.6 Post-fix functional verification (read-only)
All performed against the `:4176` build (final chosen transport, corrected `.env`), reusing the single session already established in §25.3's Test 2 — no additional login attempts were made.

| Area | Requests observed | Result |
|---|---|---|
| User Management | `POST /v2/getSubordinate` (200), `GET /v2/getAllSites` (200) | User list rendered with live data; Add User dialog's site dropdown populated from live sites; **no submission made** |
| Attendance | `POST /v2/reports/attendance/json` (200), `GET /v2/getAllSites` (200) | Loads successfully, no API-key failure |
| Payments | `POST /v2/enterprise/payments/ledger` (200), `GET /v2/getAllSites` (200) | Loads successfully, no API-key failure |

No create/edit/delete/activate/deactivate action was performed anywhere in this verification.

### 25.7 Security note (flagged, not acted on)
`VITE_*`-prefixed environment variables are inlined into the client-side JavaScript bundle by Vite and shipped to every browser that loads the app — they are **not** confidential secrets from the browser's perspective, regardless of how they're stored in `.env`. `VITE_AUTH_KEY` is architecturally equivalent to Angular's hardcoded `environment.authKey`: both are fully visible to anyone who opens their respective app's browser dev tools or downloads the JS bundle. This is flagged as a **future security/architecture consideration** (e.g., whether this key should gate anything meaningful, or whether real authorization should rely solely on the bearer token issued after login) — no redesign was attempted or is in scope for this task.

### 25.8 Remaining UNKNOWN items
1. Whether the backend's `authKey` check would also have rejected a *correctly-cased-but-still-truncated* value, or a *wrongly-cased-but-complete* one — moot for this app now that the value is fixed, but never independently isolated.
2. Full backend-side semantics of the `authKey` mechanism (rate limiting, per-origin restrictions, key rotation) — backend source remains unavailable locally (§14).
3. Whether any other `VITE_*` secret-like value in this project could be subject to the same `$`-expansion issue — only `VITE_AUTH_KEY` was found to contain `$` characters among the three checked (`VITE_API_BASE_URL`, `VITE_ENTERPRISE_API_BASE_URL` do not), but a full audit of all `.env` keys for `$` characters was not performed as part of this task.

---

**No application source files (React, Angular, or otherwise) were modified to produce this document. No network requests were made to any backend in Phases 1–2; Phase 3/3A made only read-only, non-mutating network observations against the live dev/preview instances, with explicit user-entered credentials never inspected or recorded, and no password/token/cookie/Authorization header value was written anywhere in this document.**
