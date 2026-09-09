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

**No application source files (React, Angular, or otherwise) were modified to produce this document. No network requests were made to any backend in Phases 1–2; Phase 3 made only read-only, non-mutating network observations against the live dev instance, with explicit user-entered credentials never inspected or recorded.**
