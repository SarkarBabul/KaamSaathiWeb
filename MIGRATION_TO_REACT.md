# KaamSaathi Desktop — Angular → React/Vite Migration Blueprint

> **Status:** Documentation only. No application code was modified to produce this file.
> **Source of truth:** This Angular 20 repository (`d:\Projects\KaamsaathiPC`), specifically `src/app/features/enterprise-user/**` (the "Desktop Version" surface named in the migration request) plus supporting infrastructure in `src/app/core/**` and `src/app/features/shared/**`. A parallel/legacy surface at `src/app/features/dashboard/employer/**` is also documented because it contains the *only working reference implementation* for several features that are mocked in `enterprise-user`.
> **Method:** This document was produced by exhaustive, read-only inspection of the codebase (routes, guards, interceptors, services, components, templates, package.json). Where the inspection could not establish a fact with certainty, it is explicitly flagged `UNKNOWN — REQUIRES VERIFICATION` rather than guessed.

---

## 1. Angular Application Architecture

- **Angular version:** 20.3 (`@angular/core: ^20.3.0`), Angular CLI devDependency `^21.0.4`, Angular Material `~20.2.14`, CDK `^20.2.14`.
- **Component style:** 100% standalone components. No `NgModule`-based feature modules. No `AppModule` — bootstrap is via `src/app/app.config.ts` (`ApplicationConfig`) + `bootstrapApplication` in `src/main.ts`.
- **Change detection:** Zoneless (`provideZonelessChangeDetection()` in `app.config.ts`). The app is built on Angular **Signals** (`signal()`, `computed()`) rather than Zone.js dirty-checking. This is favorable for the React port: state is already modeled as discrete reactive values per component, which maps naturally onto `useState` / `useMemo` / `useReducer`, rather than onto a diffing/observable model that would need translation.
- **Routing:** Route trees are plain `Routes` arrays in `*.routes.ts` files (no routing modules). Lazy loading is used at two granularities:
  - `loadChildren()` for whole feature areas (e.g. `/enterprise` → `enterprise-user.routes.ts`).
  - `loadComponent()` for individual pages, but **only in the legacy `dashboard/employer/**` tree** — every page there is its own lazy chunk.
  - **Inside `enterprise-user.routes.ts`, all 9 child pages are eagerly imported** at the top of that one route file (not individually `loadComponent()`'d). So today, despite `enterprise-user` being lazy-loaded as a group, there is no per-page code-splitting inside it. Decide deliberately in React whether to replicate this (one lazy chunk for the whole enterprise shell) or improve on it (per-page `React.lazy()`).
- **Naming inconsistency (cosmetic only):** Some class names carry a `Component` suffix (`UserManagementComponent`), others don't (`Attendance`, `Dashboard`, `Reports`, `Settings`, `SiteManagement`, `Home`). File names in `enterprise-user/**` are terse (`attendance.ts`, `attendance.html`, `attendance.scss`) vs. the older `dashboard/employer/**` tree's Angular-CLI-default `*.component.ts` naming. This has no architectural meaning — it's just historical drift between the older and newer code.
- **Two parallel "desktop" surfaces exist and are BOTH live** — this is the single most important architectural fact for the migration:
  | Surface | Route root | Role gate | Maturity |
  |---|---|---|---|
  | `features/enterprise-user/**` | `/enterprise/*` | `ENTERPRISE` | Newer, nicer UI (custom CSS, ApexCharts), but **several pages are fully mocked/hardcoded with no backend wiring** (see §9 in the per-feature map). |
  | `features/dashboard/employer/**` | `/dashboard/employer/*` | `admin` | Older, plainer UI (Angular Material tables), but **more functionally complete** — e.g. it has the only real AI chat backend integration, the only real Excel/PDF report generation with Material tables, and the only real expense-tracker API wiring. |

  Neither is deprecated in comments or code. **When the React port needs a feature that is mocked in `enterprise-user`, the real implementation to port business logic from is almost always in the corresponding `dashboard/employer/**` component.** This is called out per-feature in §9 below.

---

## 2. Complete Route Map

Root file: `src/app/app.routes.ts`

```
''                        redirectTo 'pages/home' (pathMatch: full)
'auth'                    lazy → features/auth/auth.routes.ts
'pages'                   lazy → features/static-pages/static.routes.ts   (public marketing/blog/pricing/faq/feature/home/estimation)
'dashboard'               canActivate: [AuthGuard]
                          lazy → features/dashboard/dashboard.routes.ts
'enterprise'              canActivate: [AuthGuard], data: { roles: ['ENTERPRISE'] }
                          lazy → features/enterprise-user/enterprise-user.routes.ts
'**'                      redirectTo 'auth/login'
```

### `auth.routes.ts` (mounted at `/auth`)
```
''                        redirectTo '/login'   ⚠ absolute path escapes the /auth prefix — likely dead/unreachable given the wildcard route above already sends unmatched paths to auth/login
'login'                   loadComponent → auth/login/login.component (Login)
'register'                loadComponent → auth/register/register.component (Register)
'enterprise-register'     loadComponent → auth/enterprise-login/enterprise-login (EnterpriseRegister)
```

### `dashboard.routes.ts` (mounted at `/dashboard`, parent already gated by `AuthGuard`)
```
'' (component: Dashboard — shell with router-outlet)
  'super-admin'  canActivate:[RoleGuard]  data:{roles:['super_admin']}  → component: InternalDashboardComponent
      ''               redirectTo 'dashboard'
      'dashboard'      loadComponent → super-admin-dashboard/pages/dashboard-home (DashboardHome)
      'pricing'        loadComponent → super-admin-dashboard/pages/pricing-dashboard (PricingDashboard)
      'bulk-whatsapp'  loadComponent → super-admin-dashboard/pages/bulk-whatsapp (BulkWhatsAppComponent)
  'employer'     canActivate:[RoleGuard]  data:{roles:['admin']}   ← legacy/alternate desktop surface, fully wired & functional
      'home'                                loadComponent → employer/home/home.component (Home)
      'attendance'                          loadComponent → employer/attendance/attendance.component (Attendance)
      'attendance/record-payment/:workerId' loadComponent → employer/attendance/components/record-payment (RecordPaymentComponent)
      'reports'                             lazy → employer/reports/report.routes.ts (REPORT_ROUTES)
      'plan'                                loadComponent → employer/pricing/pricing.component (Pricing)
      'employee-management'                 loadComponent → employer/employee-management/employee-management.component (EmployeeManagement)
      'site-management'                     loadComponent → employer/site-management/site-management.component (SiteManagement)
      'expense-tracker'                     loadComponent → employer/expense-tracker/expense-tracker.component (ExpenseTracker)
      'ai-chat'                             loadComponent → employer/ai-chat/ai-chat.component (AiChat)   ← real, working AI chat with real backend + markdown rendering
  'user'         canActivate:[RoleGuard]  data:{roles:['non-admin']}
      'home'   loadComponent → user/home/home.component (Uhome)
      'info'   loadComponent → user/info/info.component (Uinfo)
  'profile'      loadComponent → profile/profile.component (Profile)   — no guard/role restriction, common to all logged-in users
```

### `enterprise-user.routes.ts` (mounted at `/enterprise`; parent already gated by `AuthGuard` + `data:{roles:['ENTERPRISE']}` in `app.routes.ts`)
```
'' component: Home (enterprise-user/home/home.component.ts)  canActivate:[RoleGuard]  data:{roles:['ENTERPRISE']}
    ← NOTE: role is effectively checked twice (once by AuthGuard's parent data, once by this RoleGuard) — see §4 for why the parent check is actually a no-op today
  ''                  redirectTo 'dashboard'
  'dashboard'         component: Dashboard          (pages/dashboard/dashboard.component.ts)
  'user-management'   component: UserManagementComponent (pages/user-management/user-management.ts)
  'site-management'   component: SiteManagement     (pages/site-management/site-management.ts)
  'attendance'        component: Attendance         (pages/attendance/attendance.ts)
  'payments'          component: PaymentsComponent  (pages/payments/payments.ts)
  'expense-tracker'   component: ExpenseTracker     (pages/expense-tracker/expense-tracker.ts)
  'reports'           component: Reports            (pages/reports/reports.ts)
  'ai-dashboard'      component: AiDashboardComponent (pages/ai-dashboard/ai-dashboard.ts)
  'settings'          component: Settings           (pages/settings/settings.ts)
  '**'                redirectTo 'dashboard'
```

**This `enterprise-user` route list is the primary target for the React migration** (it matches the feature list named in the migration request: Dashboard, User Management, Site Management, Attendance, Payments, Expense Tracker, Reports, AI Dashboard, Settings).

Other route files exist (`report.routes.ts` under employer/reports, `internal-dashboard.routes.ts` under super-admin) but are secondary/out of primary scope; noted where they contain the only real reference implementation of a feature.

---

## 3. Authentication Architecture

**Login component:** `src/app/features/auth/login/login.component.ts` (class `Login`). Three modes via `loginMode = signal<'password'|'otp'|'forget'>('password')`.

- **Password login:**
  - Form: `mobileNumber` (`Validators.required`, `Validators.pattern('^[6-9][0-9]{9}$')`), `password` (`Validators.required`).
  - `login()` → `AuthService.login({mobileNumber, password})` → `POST /v1/authenticate/companyLogin_TP`.
  - On `res.status === 'SUCCESS' && res.statusCode === 'LOGIN_200'`: `TokenService.setLoginData(res.response)`, then reads `tokenService.getRole()`, lowercases it, and navigates via `AuthService.getRedirectRoute(role)`.
- **OTP login:**
  - `sendOtp()` → `AuthService.sendotp(mobile)` → `POST /v1/authenticate/companyLogin_OTP`; response's `otpToken` is stored locally in the component (not persisted).
  - `verifyOtp()` → `AuthService.verifyOtp({mobileNumber, otpCode, otpToken})` → `POST /v1/authenticate/consumerLogin_ValidateOTP`.
  - ⚠ **Bug to be aware of (decide whether to reproduce or fix):** OTP-mode success navigation is **hardcoded** (`admin` → `/dashboard/employer/home`, else → `/dashboard/user/home`) and does **not** call `getRedirectRoute()`. An ENTERPRISE or super_admin user logging in via OTP would be misrouted.
- **Forget password:**
  - `ForgetForm` uses a custom cross-field `passwordMatchValidator(passwordKey, confirmPasswordKey)`.
  - ⚠ **Bug:** the validator is wired with keys `'password'`/`'confrmPassword'` but the actual form controls are named `ppassword`/`cconfrmPassword` — the validator never actually fires. Decide whether to fix this in React or preserve behavior for parity during transition.
  - `updatePswd()` → `AuthService.forgetpassword(body)` → `POST /v1/authenticate/validateOtpAndResetPassword`.

**`AuthService`** (`src/app/core/services/auth.service.ts`):
| Method | Endpoint |
|---|---|
| `login` | `POST /v1/authenticate/companyLogin_TP` |
| `verifyOtp` | `POST /v1/authenticate/consumerLogin_ValidateOTP` |
| `sendotp` | `POST /v1/authenticate/companyLogin_OTP` |
| `registerOtpsend` | `POST /v1/authenticate/send-otp` |
| `enterpriseRegisterOtpsend` | `POST /v1/authenticate/generateEnterpriseOtp` |
| `register` | `POST /v1/authenticate/register-with-otp` (body hardcodes `industry:'Construction', role:'ADMIN'`) |
| `forgetpassword` | `POST /v1/authenticate/validateOtpAndResetPassword` |
| `logout()` | `TokenService.clearTokens()` then `router.navigate(['../auth/login'])` |
| `getRedirectRoute(role)` | switch on `role.toUpperCase()`: `SUPER_ADMIN`→`/dashboard/super-admin`, `ADMIN`→`/dashboard/employer/home`, `ENTERPRISE`→`/enterprise/dashboard`, default→`/dashboard/user/home` |

There is dead/commented-out code for a hardcoded super-admin frontend-only credential bypass (mobile `9090199999`) — **not active**, do not port.

**Enterprise self-registration:** `EnterpriseService` (`enterprise-login.service.ts`): `sendOtp()` → `POST /v1/authenticate/generateEnterpriseOtp`; `registerEnterprise()` → `POST /v1/authenticate/registerEnterprise`, and on success calls native `alert('Register Successfully')` then navigates to `/auth/login`. Replace the `alert()` with a proper toast in React; do not port the native dialog literally.

**No refresh-token flow exists.** A `refresh_token` value is stored but never read anywhere in the app. There is no silent re-auth, no client-side expiry check, and no interceptor that reacts to a 401 by forcing logout. If a token expires server-side, the user is simply left in a broken state until they manually navigate/re-login. **Decide during React design whether to add this missing behavior** (recommended) or preserve the gap for initial parity.

---

## 4. Authorization Architecture

Two functional route guards, both reading role/token state from `TokenService` (backed by `localStorage`, see §12).

### `AuthGuard` (`src/app/core/guards/auth.guard.ts`)
```ts
if (!tokenService.getAccessToken()) { router.navigate(['/auth/login']); return false; }
const expectedRole = route.data?.['role'] as string | undefined;   // NOTE: reads singular 'role', not 'roles'
const userRole = tokenService.getRole();
if (expectedRole && userRole !== expectedRole) { router.navigate(['/auth/login']); return false; }
return true;
```
Applied to `/dashboard` and `/enterprise` at the top level.

⚠ **Important quirk:** `app.routes.ts` sets `data:{roles:['ENTERPRISE']}` (plural, array) on the `/enterprise` route, but `AuthGuard` only ever reads `route.data?.['role']` (singular, string) — so this data is silently ignored by `AuthGuard`. In practice, `AuthGuard` on `/enterprise` only enforces "is logged in"; the real enterprise role check happens in the child `RoleGuard` inside `enterprise-user.routes.ts`. **Preserve this exact behavior unless you intentionally want to tighten it** (recommended: tighten it in the React port, since relying only on the child guard means an unauthenticated deep link briefly resolves further into the route tree before being caught).

### `RoleGuard` (`src/app/core/guards/role.guard.ts`)
```ts
const allowedRoles: string[] = (route.data['roles'] || []).map(r => r.toLowerCase());
const userRole = tokenService.getRole()?.toLowerCase();
if (userRole && allowedRoles.includes(userRole)) return true;
const isAdmin = userRole === 'admin';
if (allowedRoles.includes('admin') && isAdmin) return true;
if (allowedRoles.includes('non-admin') && !isAdmin) return true;
switch (userRole) {
  case 'super_admin': router.navigate(['/dashboard/super-admin']); break;
  case 'admin': router.navigate(['/dashboard/employer/home']); break;
  case 'ENTERPRISE': router.navigate(['/enterprise/dashboard']); break;  // ⚠ dead branch — userRole was already lowercased above, so this uppercase literal never matches
  default: router.navigate(['/dashboard/user/home']);
}
return false;
```
Applied to: `/dashboard/super-admin` (`roles:['super_admin']`), `/dashboard/employer` (`roles:['admin']`), `/dashboard/user` (`roles:['non-admin']`), `/enterprise` root (`roles:['ENTERPRISE']`).

⚠ **Bug with real user impact:** because `userRole` is lowercased before the `switch`, the `case 'ENTERPRISE':` branch can never match. An enterprise user who fails some other role check anywhere in the app is incorrectly redirected to `/dashboard/user/home` instead of `/enterprise/dashboard`. **Decide explicitly whether to reproduce this bug (for byte-for-byte behavioral parity during a phased migration) or fix it (recommended for the final React app).** Mark this decision in your project tracker — do not silently "fix" it without the team knowing behavior changed.

**Authorization model summary:** role is a single flat string per user (`super_admin` | `admin` | `ENTERPRISE` | anything else treated as "non-admin"/generic user), stored client-side only, sourced once at login and never re-verified against the backend. There is no granular permission system (no per-feature permission flags, no RBAC beyond this coarse role string) anywhere in the inspected code.

---

## 5. API Inventory

Base URLs (see §11 for full environment file): `apiBaseUrl` (default) and `enterpriseapiBaseUrl` (used only when explicitly flagged — see `ApiService` behavior below, including its bugs).

### Auth (`/v1/authenticate/*`)
| Method | Endpoint | Used by |
|---|---|---|
| POST | `/v1/authenticate/companyLogin_TP` | password login |
| POST | `/v1/authenticate/companyLogin_OTP` | send OTP for login |
| POST | `/v1/authenticate/consumerLogin_ValidateOTP` | verify OTP login |
| POST | `/v1/authenticate/send-otp` | registration OTP |
| POST | `/v1/authenticate/generateEnterpriseOtp` | enterprise registration OTP |
| POST | `/v1/authenticate/register-with-otp` | registration |
| POST | `/v1/authenticate/registerEnterprise` | enterprise registration |
| POST | `/v1/authenticate/validateOtpAndResetPassword` | forget-password reset |
| POST | `/v1/authenticate/subordinates/AttandanceReport` | employer attendance report (JSON; note backend typo "Attandance" — do not "fix" without confirming with backend) |
| GET/POST | `/v1/authenticate/subordinates/PaymentReport` (+ `/pdf`, `/excel`, with a literal `?siteId=' '` quoted-space querystring bug preserved from source) | employer payment report |
| POST | `/v2/authenticate/permanentDeleteSubordinate` | delete employee (body `{id}`) |

### Enterprise dashboard / attendance / payments (`/v2/enterprise/*`, `/v2/reports/*`)
| Method | Endpoint | Used by |
|---|---|---|
| GET | `/v2/enterprise/dashboard/site-summary?enterpriseId={userId}` | enterprise Dashboard |
| GET | `/v2/enterprise/dashboard/worker-attendance-summary?enterpriseId={userId}` | enterprise Dashboard |
| GET | `/v2/enterprise/dashboard/monthly-finance-summary?enterpriseId={userId}` | enterprise Dashboard |
| POST | `/v2/reports/attendance/json` body `{userId, startDate?, endDate?}` | enterprise Attendance |
| POST (blob) | `/v2/reports/attendance/pdf` | enterprise Attendance export |
| POST (blob) | `/v2/reports/attendance/excel` | enterprise Attendance export |
| POST | `/v2/enterprise/payments/ledger` body `{enterpriseId(=userId), startDate?, endDate?}` | enterprise Payments |
| POST (blob) | `/v2/enterprise/payments/ledger/export/pdf` | enterprise Payments export |
| POST (blob) | `/v2/enterprise/payments/ledger/export/excel` | enterprise Payments export |

> Note: `enterpriseId` query params above are actually populated from `TokenService.getUserId()` (the logged-in user's own ID) — naming is misleading but that is the real value sent.

### User / employee / site management (`/v2/*`)
| Method | Endpoint | Used by |
|---|---|---|
| POST | `/v2/getAllRoles` | role dropdown lookups |
| GET | `/v2/getAllSites?userId={userId}` | site dropdown lookups |
| POST | `/v2/addSite` body `{...payload, userId: parentId}` | Site Management create |
| PUT | `/v2/updateSite` body `{...payload, userId: parentId}` | Site Management edit |
| GET | `/v2/{parentId}/assignment-status` | employee assignment status |
| POST | `/v2/addSubordinate` body `{...payload, parentUserId: parentId}` | User Management create |
| POST | `/v2/getSubordinate` body `{parentId}` | User Management list (envelope shape differs — see §7) |
| POST | `/v2/editSubordinate` | User Management edit |
| POST | `/v2/upload-excel` multipart `FormData{file, leaderId}` | bulk employee import (server-side parsing, not client-side xlsx) |

### Expense tracker (`/v2/*`, real implementation used only by `dashboard/employer/expense-tracker`)
| Method | Endpoint |
|---|---|
| GET | `/v2/dashboard?leaderId={parentId}` |
| GET | `/v2/transactions?leaderId={parentId}` |
| GET | `/v2/categories?type={type}` |
| POST | `/v2/transactions/income` |
| POST | `/v2/transactions/expense` |
| POST | `/v2/transactions/update/{type}/{id}` |
| DELETE | `/v2/transactions/{id}` |

### AI chat (real implementation used only by `dashboard/employer/ai-chat`)
| Method | Endpoint |
|---|---|
| POST | `/v2/chatbot/chat` body `{message, leaderId: parentId}` |
| GET | `/v2/chatbot/sessions?leaderId={parentId}` |
| GET | `/v2/chatbot/history/{sessionId}` |

### Pricing / payment gateway, super-admin, WhatsApp (secondary scope)
| Method | Endpoint |
|---|---|
| PUT | `/v2/plans/{planId}` |
| GET | `/v2/plans?type={type}` |
| POST | `/v2/payment/createOrder` |
| POST | `/v2/payment/verifyPayment` — pattern suggests a payment gateway (e.g. Razorpay); **UNKNOWN — REQUIRES VERIFICATION** which gateway/SDK is actually used; check `pricing.component.ts` before porting. |
| POST | `/v2/whatsapp/send-bulk` |
| POST | `/v2/whatsapp/retry-failed` |
| POST | `/v2/users/count`, `/v2/users/registered`, `/v2/users/new`, `/v2/users/active-count`, `/v2/users/demographics`, `/v2/leaders/summary` | super-admin KPI dashboard |

### Strapi CMS (marketing/blog content)
Calls to `environment.strapiUrl` (`https://kaamsaathi-cms.onrender.com`) bypass the app's auth header entirely (see §6/`authInterceptor`). Exact endpoints used by `BlogService` were not enumerated in this pass — **UNKNOWN — REQUIRES VERIFICATION** if the React static-pages/blog area is in scope for this migration (the user's feature list does not name it, so it is likely out of scope).

---

## 6. Service Inventory

All in `src/app/core/services/*` unless noted.

| Service | File | Responsibility |
|---|---|---|
| `ApiService` | `api.service.ts` | Central HTTP wrapper — see detailed bug notes below. |
| `TokenService` | `token.service.ts` | Reads/writes auth/session fields via `StorageService`. See §12. |
| `StorageService` | `storage.service.ts` | Thin `localStorage` JSON wrapper. See §12. |
| `AuthService` | `auth.service.ts` | Login/OTP/register/forget-password/logout/role-based redirect. See §3. |
| `EnterpriseService` | `enterprise-login.service.ts` | Enterprise self-registration OTP flow. |
| `DashboardService` | `enterprise-dashboard.service.ts` | Enterprise Dashboard page's 3 summary calls. |
| `AttendanceService` | `enterprise-attendance.service.ts` | Enterprise Attendance page: fetch + PDF/Excel export. |
| `PaymentService` | `enterprise-payments.ts` | Enterprise Payments page: fetch + PDF/Excel export. |
| `MasterDataService` | `master-data.service.ts` | Shared lookups: roles, sites. |
| `SiteManagementService` | `site-management.service.ts` | Add/edit site. |
| `EmployeeManagementService` | `employee-management.service.ts` | User Management CRUD + bulk Excel upload. |
| `ExpenseTrackerService` | `expense-tracker.service.ts` | Real expense CRUD — used only by legacy `dashboard/employer/expense-tracker`. |
| `ReportService` | `report.service.ts` | Real attendance/payment report generation (PDF/Excel/JSON) — used only by legacy `dashboard/employer/reports/**`. |
| `AiReportService` | `ai-report.service.ts` | Real chatbot backend — used only by legacy `dashboard/employer/ai-chat`. |
| `SnackbarService` | `SnackbarService.service.ts` | Wraps `MatSnackBar` for success/error toasts — exists but used inconsistently (many pages use `alert()`/`console` instead). |
| `EncryptionService` | `Encryption.service.ts` | Web Crypto AES-GCM encrypt/decrypt. Currently dormant (its interceptor is disabled). |
| `Decryption.service.ts` | — | **Empty file, dead code.** Do not port. |
| `notification.service.ts` | — | **Empty file, dead code.** Do not port. |
| `BlogService` | `blog.service.ts` | Strapi-backed marketing content. Out of primary scope. |
| `BulkWhatsAppService` | `bulk-whatsapp.service.ts` | Super-admin bulk WhatsApp tool. Out of primary scope. |
| `PricingService` | `pricing-service.ts` | Plans + payment gateway create/verify order. |
| `SuperAdminUsersService` | `super-admin-users.service.ts` | Super-admin KPI dashboard. Out of primary scope. |
| `super-admin-pricing.service.ts` | — | No `http.*` calls found in this pass — **UNKNOWN — REQUIRES VERIFICATION** whether it's genuinely unused or thin/re-exporting. |
| `response-mapper.service.ts` | — | **Entirely commented out, dead code.** Was intended as a generic response-envelope unwrapper with toast side-effects; never activated. Every page instead manually checks `res.status === 'SUCCESS'` inline. **Recommend the React port centralize this** (e.g. one API client wrapper or hook that normalizes envelopes and fires toasts), since the Angular app never got around to it and paid for that with repeated inline boilerplate. |

### `ApiService` — critical implementation detail, must be understood before porting any feature

`ApiService` (`api.service.ts`) is a thin `HttpClient` wrapper with a `flag`/`isEnterprise` boolean parameter meant to select which base URL to hit. **Its behavior is inconsistent across verbs — this is a real, live bug surface that affects several features:**

- `get<T>(url, params?, headers?, flag=false)`: **`flag` has zero effect.** Always hits `${apiBaseUrl}${url}` regardless of the flag's value. Callers that pass `true` expecting `enterpriseapiBaseUrl` (e.g. `MasterDataService.getSites(isEnterprise)`) are silently ignored.
- `post<T>(url, body?, params?, headers?, flag=false)`: **This is the real "which backend" switch** — `flag ? enterpriseapiBaseUrl+url : apiBaseUrl+url`.
- `put<T>(url, body, params?, headers?, flag=false)`: same enterprise/base switch as POST.
- `delete<T>(url, params?, headers?)`: **No enterprise-flag parameter at all** — always hits `apiBaseUrl`.
- `postBlob(url, body?, params?, headers?)`: always `apiBaseUrl`, `responseType:'blob'`. Used for every PDF/Excel export.
- Verbose `console.log` of every request is left in on GET/POST/DELETE — strip this when porting.
- The `headers` parameter passed by callers is largely ignored except in `get()` — `post`/`put`/`delete` do not actually attach caller-supplied headers to the HTTP call options in the same way.

**Concrete consequences found in feature code (see §9 for detail):**
- `MasterDataService.getSites(isEnterprise)` — the flag is passed through to `ApiService.get`, which ignores it. Always hits the default base URL regardless of the boolean.
- `EmployeeManagementService.getEmployees()` is called by the enterprise User Management page **without** passing `true` — silently hits the base API, not the enterprise API, despite living on an "enterprise" page.
- `EmployeeManagementService.deleteEmployee()` is called the same way — no enterprise flag, defaults to base API.
- `SiteManagementService.addSite()` is called by Site Management's create flow **without** the enterprise flag, while `editSite()` on the same page **is** called with `true` — an inconsistency between create and edit on the same page.

**Recommendation for the React port:** design a single typed API client (e.g. one Axios/fetch instance per base URL, or one client with an explicit `target: 'default' | 'enterprise'` argument that is *actually* respected on every verb) rather than reproducing this ad hoc, per-verb, sometimes-ignored flag. Decide explicitly, feature by feature, which of the two backends each call in §5 should really hit — the table in §5 states what happens *today*, not necessarily what should happen after the fix. Flag this decision to the person overseeing the migration rather than silently resolving it either way.

---

## 7. Model/Interface Inventory

> Only interfaces with confirmed field names from direct inspection are listed. Feature-local types not exhaustively enumerated (e.g. `expense-tracker.types.ts`, chart option interfaces) are noted where they exist so a future session can go read them directly.

- **User Management** — `interface User { id: number; name: string; mobileNumber: string; roleId: string; roleName: string; siteId: number; siteName: string; active: number }` (`active` is a numeric `0|1` flag, not boolean). Defined in `enterprise-user/pages/user-management/user-management.ts`.
- **Site Management** — `interface Site { siteId: number; siteName: string; address: string; pinCode: string }`. Defined in `enterprise-user/pages/site-management/site-management.ts`.
- **Attendance** — `interface AttendanceRecord { workerId: number; workerName: string; workerRole: string; site: string; date: string; siteManager: string; status: 'Present' | 'Absent' | 'Overtime' | 'Half Day' }`. The raw API response is grouped by site (`{ site, supervisor, rows: [...] }`); the component flattens groups into this flat shape client-side (denormalizing `site`/`supervisor` onto every row) — **this flattening is real business logic that must be replicated exactly** if the backend contract is unchanged.
- **Payments** — `interface PaymentRow { payoutId: number; worker: string; role: string; site: string; siteManager: string; attendance: number; dailyWage: number; earnings: number; advance: number; current: number; due: number; lastPaid: string; status: 'Paid' | 'Partial' | 'Pending' }`. Same group→flat-row transformation as Attendance, with fallback chains: `row.siteName ?? group.site ?? '—'`, `row.siteManagerName ?? group.supervisor ?? '—'`. Raw backend status strings are normalized via `mapPaymentStatus()`: `'PAID'`→`'Paid'`, `'PARTIAL'|'PARTIALLY_PAID'`→`'Partial'`, anything else→`'Pending'`.
- **Expense Tracker (real, employer version)** — types in `src/app/features/dashboard/employer/expense-tracker/type/expense-tracker.types.ts`: `AmountResponse`, `Category`, `Transaction`. **UNKNOWN — REQUIRES VERIFICATION**: exact field names were not enumerated in this pass; read that file directly before implementing the React expense tracker against real data.
- **Expense Tracker (mocked, enterprise version)** — local-only `ExpenseLedger` shape: `{ ref, site, category, vendor, amount: string, status: 'Paid'|'Partial'|'Pending' }` — this is mock data, not an API contract; do not treat as authoritative.
- **AI Dashboard (mocked)** — `ChatMessage { sender: 'bot'|'user'; text: string }`, `SuggestionCard { type: 'danger'|'warning'|'info'|'success'; title: string; note: string }`.
- **Login/Auth response** — the shape stored via `TokenService.setLoginData(res.response)` implies the backend `LoginResponse` contains at least: `accessToken`, `refreshToken`, `role`, `id`, `username`, `mobileNumber`, `planId` (inferred from what is destructured and stored — see §12). **UNKNOWN — REQUIRES VERIFICATION**: full exact response envelope/typing was not directly quoted from a `LoginResponse` interface file; confirm field casing against the live API before hardcoding a React type.
- **Response envelope inconsistency (important for the React API layer):** most endpoints return a `res.data` payload after a `res.status === 'SUCCESS'` check, but `getSubordinate` (User Management list) instead checks `res.status === 'SUCCESS' && res.subordinates` and reads `res.subordinates` — a differently-shaped envelope than most other endpoints. The Dashboard's `monthlyFinanceSummary` call also reads fields directly off `res` root rather than `res.data`, inconsistent with the other two Dashboard calls on the same page. **Do not assume one universal envelope shape — verify per endpoint.**

---

## 8. Shared Component Inventory

Located under `src/app/features/shared/components/**` unless noted.

- **Layout — header:** `layout/SA-header/header.component.ts` (selector `app-super-admin-header`). Despite the "SA-" (super-admin) naming, **this header is reused by `enterprise-user/home` too**. Reads `userName`/`userRole` from `TokenService`; has a profile dropdown (`isDropdownOpen`); `goToSettings()` navigates to the **hardcoded** path `enterprise/settings` (verify this doesn't misfire if the header is ever reused somewhere the enterprise path doesn't apply); `signOut()` calls `AuthService.logout()`.
- **Layout — sidebar:** `layout/SA-aside/aside-bar.component.ts` (selector `app-aside-bar`). Hardcoded `routerLink`s for all 9 enterprise nav items (`dashboard`, `user-management`, `site-management`, `attendance`, `payments`, `expense-tracker`, `reports`, `ai-dashboard` — carries a static "New" badge, `settings`). The bottom plan-summary card ("ENTERPRISE PLAN · 06 sites · Unlimited users") is entirely static HTML with a non-functional "Manage subscription" button (no click handler bound).
- **Layout — legacy variants:** `header-bar/header-bar.ts`, `sidebar/sidebar.component.ts`, `navbar/navbar.component.ts`, `footer/footer.component.ts` — used by the `dashboard/employer` legacy surface and static marketing pages, not by `enterprise-user`. Out of primary scope unless the employer surface is also being migrated.
- **Loader:** `components/loader/loader.ts` (selector `app-loader`) — **empty component class**, just a spinner template+styles. Not wired into any global HTTP-loading state; imported ad hoc into a few employer-side components. Each page manages its own `loading` signal manually. There is no central loading-state pattern to reproduce — the React port should design one fresh (e.g. a query-library's built-in `isLoading`) rather than port this.
- **Pipe:** `shared/pipe/percent.pipe.ts` — `PercentagePipe`, **pipe name is `'percentagee'`** (note the double "e" — preserve exact spelling only if any legacy template still references it by name; irrelevant for a fresh React implementation). `transform(value, fractionDigits=2)`: returns `'0.00%'` for null/NaN, else `value.toFixed(fractionDigits) + '%'`. Used in the employer attendance report for present/absent percentages.
- **Utils:** `shared/utils/crypto.utils.ts` — **empty file, dead code.**
- **Constants:** `shared/constants/image.ts` — trivial static asset path map (`IMAGES.aboutTeam`, `IMAGES.logo`).
- **Material imports bundle:** `shared/material/material.imports.ts` — a `MATERIAL_IMPORTS` array (`MatFormFieldModule`, `MatInputModule`, `MatSelectModule`, `MatButtonModule`, `MatIconModule`, `MatDatepickerModule`, `MatNativeDateModule`, `MatCheckboxModule`, `MatRadioModule`, `MatTabsModule`, `MatTableModule`, `MatDialogModule`, `MatProgressSpinnerModule`) spread into components that need Material. **Important: none of the `enterprise-user/pages/**` components use Angular Material at all** — they're plain HTML/CSS + FontAwesome icon classes. Material is only used by the legacy `dashboard/employer/reports/**` and `super-admin-dashboard/**` surfaces. This means the primary migration target has **no Material component semantics to replicate** — a React/Tailwind (or any CSS approach) port is unconstrained by Material's component API for the in-scope pages.

---

## 9. Feature-by-Feature Migration Map

General patterns across **all** `enterprise-user/pages/**` components (stated once here to avoid repetition below):
- Standalone components, `CommonModule` + `FormsModule`/`ReactiveFormsModule` as needed, **no Angular Material**.
- No shared/global loading component — each page owns a local `loading` signal.
- No centralized toast — errors go to `console.error` and/or a local `error` string signal; **User Management uses raw `alert()`** for add/edit success/failure, inconsistent with the unused `SnackbarService`. Standardize on one toast pattern in React rather than reproducing this inconsistency.
- Tables are plain HTML `<table>` + `*ngFor`/`@for`, filtered via Angular `computed()` signals, entirely **client-side**. There is no server-side pagination or sorting anywhere in this feature area. (The legacy employer reports pages use `MatTableDataSource` for a Material table, but that too is client-side over a single fetched response — no true server pagination exists anywhere in the app that was found.)
- No currency/number Angular pipes are used in `enterprise-user` — values are raw numbers bound directly, or are pre-formatted strings baked into mock data (e.g. `'₹78.4 L'`). There is no live currency-formatting logic to reverse-engineer for the real API-driven parts of this feature area.

---

### FEATURE: Dashboard
- **Angular route:** `/enterprise/dashboard`
- **Component(s):** `Dashboard` — `pages/dashboard/dashboard.component.{ts,html,scss}`
- **Services used:** `DashboardService` (`enterprise-dashboard.service.ts`)
- **API endpoints used:**
  - `GET /v2/enterprise/dashboard/site-summary?enterpriseId={userId}`
  - `GET /v2/enterprise/dashboard/worker-attendance-summary?enterpriseId={userId}`
  - `GET /v2/enterprise/dashboard/monthly-finance-summary?enterpriseId={userId}` (reads response fields off `res` root, not `res.data` — inconsistent with the other two calls)
- **Models/interfaces used:** none formally typed beyond inline signal shapes; response fields consumed: site-summary → `totalSites`, `activeSites`, `siteManagers`; worker-attendance-summary → `totalWorkers`, `presentToday`, `attendancePercentage`, `absentToday`; monthly-finance-summary → `monthlyIncome`, `monthlyExpense`.
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`) via the parent `enterprise-user.routes.ts` entry, plus outer `AuthGuard`.
- **Child components:** none (single page).
- **Dialogs/modals:** none.
- **Validation:** none (read-only page).
- **Important business logic / what is real vs. mocked:**
  - **Real, API-driven:** the stat tiles listed above.
  - **Mocked/hardcoded — NOT wired to any API, must be built fresh or wired to new endpoints:** `projectCompletion` (`{percent:68, onTrack:4, atRisk:1, delayed:1}`); `attendanceChart` (7-day area chart, hardcoded weekday series); `workerChart` (donut, hardcoded role distribution); `financeChart` (6-month combo bar+line, hardcoded); `siteLabourChart` (horizontal bar of hardcoded site names); the "AI Insights" card (3 static insight items); all "Quick Actions" buttons (no click handlers bound at all).
  - The `attendanceView` toggle (daily/weekly/monthly) only changes which button *looks* active — it does not refetch or re-render different data. This is decorative today; decide whether the React version should make it functional.
  - Charts use `ng-apexcharts`/`apexcharts` (4 charts: area, donut, combo bar+line, horizontal bar) via typed Apex* option objects — these are plain JS objects and port almost verbatim to `react-apexcharts` (same underlying `apexcharts` engine).

---

### FEATURE: User Management
- **Angular route:** `/enterprise/user-management`
- **Component(s):** `UserManagementComponent` — `pages/user-management/user-management.{ts,html,scss}`
- **Services used:** `MasterDataService.getSites()` (site dropdown), `EmployeeManagementService` (`getEmployees`, `addEmployee`, `editSubordinate`, `deleteEmployee`)
- **API endpoints used:**
  - `POST /v2/getSubordinate` body `{parentId}` — list (called **without** the enterprise flag — hits base API despite this being the enterprise page)
  - `POST /v2/addSubordinate` body `{...payload, parentUserId: parentId}` — create (called **with** enterprise flag `true`)
  - `POST /v2/editSubordinate` — edit (called **with** enterprise flag `true`)
  - `POST /v2/authenticate/permanentDeleteSubordinate` body `{id}` — delete (called **without** enterprise flag)
- **Models/interfaces used:** `User { id, name, mobileNumber, roleId, roleName, siteId, siteName, active: 0|1 }` (see §7)
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none — custom dropdowns/menus are inline, not separate components.
- **Dialogs/modals:** an "Add/Edit User" modal (`closeAddUserModal()` referenced) — implemented inline in the same component, not a separate `MatDialog`.
- **Validation:** `addUserForm` (Reactive Forms) — `name: [required]`, `mobileNumber: [required, Validators.pattern(/^[6-9]\d{9}$/)]`, `role: [required]`, `site_id: [required]`.
- **Important business logic:**
  - `getEmployees()` success check is `res.status === 'SUCCESS' && res.subordinates` (reads `res.subordinates`, **not** `res.data` — a differently-shaped envelope than most endpoints; do not assume a uniform envelope).
  - `submitAddUser()` builds `{name, role, mobileNumber, siteId: Number(site_id)}`; edit mode adds `userId: editingUserId`. Both success/failure paths use raw `alert()`.
  - `toggleStatus(user)` is **purely local** — flips `user.active` in memory with **no API call**; does not persist to the backend. This is a functional gap: decide whether the React version should call a real activate/deactivate endpoint (if one exists — **UNKNOWN — REQUIRES VERIFICATION**, no such endpoint was found in this codebase) or keep it cosmetic-only for parity.
  - `deleteUser()` calls `deleteEmployee(user.id)` without the enterprise flag — hits the base API.
  - Filtering: client-side substring match on `name`/`mobileNumber`/`siteName` (case-insensitive) AND exact match on `roleName` against a `selectedRole` dropdown. Dropdown options (`uniqueRoles`) are derived from the currently-loaded `users` array, **not** from a separate roles API call (despite `MasterDataService.getRoles()` existing and being unused here).
  - Dropdown/menu UI uses `showRoleDropdown`/`activeMenuIndex` booleans + `@HostListener('document:click')` to close on outside-click — replicate with a click-outside hook in React (`useRef` + document listener, or a headless UI menu primitive).
  - No export/download functionality on this page.
  - **Bug to flag for the team:** the enterprise-flag inconsistency across the 4 API calls on this single page (list=false, create=true, edit=true, delete=false) means User Management may be reading/writing across two different backends depending on the action. Confirm with backend which is actually correct before wiring the React version.

---

### FEATURE: Site Management
- **Angular route:** `/enterprise/site-management`
- **Component(s):** `SiteManagement` — `pages/site-management/site-management.{ts,html,scss}`
- **Services used:** `MasterDataService.getSites()`, `SiteManagementService` (`addSite`, `editSite`)
- **API endpoints used:**
  - `POST /v2/addSite` body `{...payload, userId: parentId}` — create (called **without** enterprise flag)
  - `PUT /v2/updateSite` body `{...payload, userId: parentId}` — edit (called **with** enterprise flag `true`)
- **Models/interfaces used:** `Site { siteId, siteName, address, pinCode }`
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** inline add/edit form (not a separate `MatDialog`).
- **Validation:** `siteForm` — `siteName: [required]`, `address: [required]`, `pinCode: [Validators.pattern(/^\d{6}$/)]`. **Note:** `pinCode` is only pattern-checked, NOT marked `required` — a 6-digit value is enforced only if something is entered. Preserve this nuance.
- **Important business logic:**
  - Edit success does an **optimistic local merge** into the `sites` signal (`sites.update(current => current.map(...))`) rather than refetching, then sets a `lastUpdatedSite` signal for 3 seconds via `setTimeout` — this almost certainly drives a "recently updated" highlight CSS class in the template. Replicate this transient-highlight UX if desired.
  - Create success appends the server response to the local array **and** calls `fetchSites()` to fully refetch — a redundant double-update (local push then full refetch); safe to simplify in React to just refetch (or just optimistic update, but not both).
  - `onDeleteSite(site)` is a **stub only** — logs to console and closes the menu; **there is no real delete API call, and `SiteManagementService` doesn't even have a delete method.** This is a genuine missing feature, not a bug — decide whether to build real delete support in React or keep it absent for initial parity.
  - Filtering: client-side substring search across `siteName`/`address`/`pinCode` (all lowercased) AND exact match on a `selectedSiteFilter`.
  - Same custom `activeMenuIndex` dropdown/menu pattern as User Management.
  - No export/download.

---

### FEATURE: Attendance
- **Angular route:** `/enterprise/attendance`
- **Component(s):** `Attendance` — `pages/attendance/attendance.{ts,html,scss}` (has an accompanying `.spec.ts`, likely default Angular test scaffold — **UNKNOWN — REQUIRES VERIFICATION** whether it contains meaningful assertions worth porting to a React test).
- **Services used:** `AttendanceService` (`enterprise-attendance.service.ts`), `MasterDataService.getSites()`
- **API endpoints used:**
  - `POST /v2/reports/attendance/json` body `{userId, startDate?, endDate?}`
  - `POST (blob) /v2/reports/attendance/pdf`
  - `POST (blob) /v2/reports/attendance/excel`
- **Models/interfaces used:** `AttendanceRecord { workerId, workerName, workerRole, site, date, siteManager, status }` (see §7 for the group→flat-row transform)
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none (read-only viewer); date range must satisfy `start <= end` (plain string comparison — works because ISO `YYYY-MM-DD` strings sort lexicographically) before a refetch is triggered, and both dates are required before exports are enabled.
- **Important business logic:**
  - Raw API response is an array of **groups** (`{ site, supervisor, rows: [...] }`); the component **flattens** these into a flat `AttendanceRecord[]`, denormalizing `site`/`supervisor` onto every row. **This transformation must be reproduced exactly** if the backend contract is unchanged.
  - `onStartDateChange()`/`onEndDateChange()` both call `loadAttendanceByDate()`, which only refetches once both dates are present and valid.
  - Client-side `computed()` filters: `filteredRecords` by `selectedSite`/`selectedManager` (case-insensitive, trimmed) and `selectedRole` (exact match); `uniqueSites`/`uniqueManagers`/`uniqueRoles` are derived from currently-loaded records, excluding a `'—'` placeholder value. Summary tiles (`totalWorkers`, `presentCount`, `absentCount`, `halfDayCount`, `overtimeCount`) are simple `.filter().length` counts over the filtered set.
  - **Export:** `exportPDF()`/`exportExcel()` require both dates; call the blob-returning service methods, then use the shared download idiom (see §15) with filename `AttendanceReport_{start}_{end}.pdf|xlsx`. **This is server-generated file streaming, not client-side spreadsheet generation** — the `xlsx` npm package is not involved here at all, only the `.xlsx` extension in the download filename.

---

### FEATURE: Payments
- **Angular route:** `/enterprise/payments`
- **Component(s):** `PaymentsComponent` — `pages/payments/payments.{ts,html,scss}`
- **Services used:** `PaymentService` (`enterprise-payments.ts`), `MasterDataService.getSites()`
- **API endpoints used:**
  - `POST /v2/enterprise/payments/ledger` body `{enterpriseId(=userId), startDate?, endDate?}`
  - `POST (blob) /v2/enterprise/payments/ledger/export/pdf`
  - `POST (blob) /v2/enterprise/payments/ledger/export/excel`
- **Models/interfaces used:** `PaymentRow { payoutId, worker, role, site, siteManager, attendance, dailyWage, earnings, advance, current, due, lastPaid, status }` (see §7)
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none (read-only ledger); export requires both dates, same pattern as Attendance.
- **Important business logic:**
  - Same group→flatMap transform as Attendance, with fallback chains for missing site/manager names (see §7).
  - `mapPaymentStatus(status)` normalizes raw backend status strings — reproduce exactly: `'PAID'`→`'Paid'`, `'PARTIAL'|'PARTIALLY_PAID'`→`'Partial'`, else→`'Pending'`.
  - Aggregate computeds over the **currently loaded** (not necessarily filtered) payments array: `totalLabourCost` = sum of `dailyWage` (⚠ note: an earlier commented-out version of this summed `earnings` instead — the *currently active* logic sums `dailyWage`; confirm with the business which is actually correct before porting, since this affects a headline financial figure), `totalPaid` = sum of `current`, `advancePaid` = sum of `advance`, `remainingDue` = sum of `due`, `pendingPayments` = count where `status !== 'Paid'`.
  - `activeTab: 'All' | 'Site-wise' | 'Site Manager-wise'` exists via `setTab()`, but no branching logic tied to it was found in the `.ts` file — it likely only affects grouping/rendering in the `.html` template. **UNKNOWN — REQUIRES VERIFICATION:** read `payments.html` directly to confirm what the tab actually changes before reproducing it in React.
  - `statusClass(status)`: `'Paid'`→`'badge-green'`, `'Partial'`→`'badge-yellow'`, else→`'badge-pink'`.
  - Filtering: client-side, `selectedSite` (trimmed, case-insensitive), `selectedManager`/`selectedWorker` (exact match).
  - Export: identical blob-download pattern to Attendance, filenames `PaymentReport_{start}_{end}.pdf|xlsx`.

---

### FEATURE: Expense Tracker
- **Angular route:** `/enterprise/expense-tracker`
- **Component(s):** `ExpenseTracker` — `pages/expense-tracker/expense-tracker.{ts,html,scss}`
- **Services used:** **none — no service is injected, no HTTP calls at all.** This page is entirely mocked.
- **API endpoints used:** none (see below for the real implementation to port logic from).
- **Models/interfaces used:** local-only mock shapes (`statCards`, `ExpenseLedger`), not real API contracts.
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none.
- **Important business logic:**
  - Hardcoded content: 4 KPI stat cards (Monthly Income ₹78.4L, Monthly Expense ₹58.1L, Net Margin ₹20.3L, Vendor Payable ₹8.9L, each with a static "+X% vs last month" subtext); a 6-month bar chart (`monthlyExpenseChart`, hardcoded series `[34,39,41,45,52,58]`); a 10-category donut breakdown (`categoryBreakdownChart`: Cement/Steel/Bricks/Sand/Paint/Equipment/Labour/Water/Food/Transport); a 6-row `expenseLedger` table.
  - **The real backend integration exists and must be ported from elsewhere:** `ExpenseTrackerService` (`core/services/expense-tracker.service.ts`) has `getAmount`, `getTransactionHistory`, `getCategories`, `addTransaction`, `updateTransaction`, `deleteTransaction` (endpoints listed in §5), and is actually consumed by `dashboard/employer/expense-tracker/expense-tracker.component.ts`. **To build a functional React Expense Tracker, read that employer component (not this mocked enterprise one) as the reference implementation for real data flow, forms, and business logic**, then apply it inside the nicer enterprise-style UI/layout.
  - No export/download functionality currently exists on either the mocked or the real version — **UNKNOWN — REQUIRES VERIFICATION** whether export is expected here.

---

### FEATURE: Reports
- **Angular route:** `/enterprise/reports`
- **Component(s):** `Reports` — `pages/reports/reports.{ts,html,scss}`
- **Services used:** **none — entirely mocked, no API calls.**
- **API endpoints used:** none (see below for the real implementation to port logic from).
- **Models/interfaces used:** none formal — plain hardcoded string arrays.
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none.
- **Important business logic:**
  - `ranges` = `['Monthly','Weekly','Daily','Yearly']`; `sites`/`siteManagers` are hardcoded placeholder strings (`'Site 1'`, `'Manager 1'`, etc. — **not real data**, do not treat as a data source); 7 static report-type cards (Attendance/Payment/Expense/Income/Worker/Site/Site Manager Reports), each just `{title, description, colorClass}`.
  - `exportReport(reportName, format)` is a **stub — only `console.log`s**, no real export/download logic implemented.
  - **The real, fully-functional implementation exists in `dashboard/employer/reports/**`** (`ReportService` — see §5/§6): real PDF/Excel/JSON generation for attendance and payment reports, using Angular Material tables (`MatTableDataSource`) over the fetched data. **This is the reference implementation to port when building a real React Reports page** — note the backend's exact endpoint quirks preserved there (`AttandanceReport` typo, the `?siteId=' '` literal-quoted-space querystring bug) must be confirmed with backend before deciding whether to reproduce or clean them up.

---

### FEATURE: AI Dashboard
- **Angular route:** `/enterprise/ai-dashboard`
- **Component(s):** `AiDashboardComponent` — `pages/ai-dashboard/ai-dashboard.{ts,html,scss}`
- **Services used:** **none — no `AiReportService` injected, entirely mocked chat.**
- **API endpoints used:** none on this page (see below for the real implementation).
- **Models/interfaces used:** `ChatMessage { sender: 'bot'|'user'; text: string }`, `SuggestionCard { type, title, note }`.
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none.
- **Important business logic:**
  - `sendMessage(text?)` pushes a user message, clears input, then after a hardcoded `setTimeout(600ms)` pushes **one canned bot reply string, always the same text regardless of the question asked.**
  - `quickQuestions` (5 canned prompts) route through `askQuickQuestion()` → `sendMessage()`.
  - `suggestionCards` — 4 static insight cards duplicating the same "AI Insights" content seen on the Dashboard page.
  - `selectedLanguage: 'English'|'हिंदी'` toggle exists (`setLanguage()`) but has **no effect on message generation** — purely a UI toggle today.
  - Auto-scroll on new message via `ngAfterViewChecked()` + `ElementRef` (`chatBody.scrollTop = chatBody.scrollHeight`) — standard chat-scroll idiom, replicate in React with a `ref` + `useLayoutEffect`.
  - **The real backend + markdown rendering exists in `dashboard/employer/ai-chat/ai-chat.component.ts` (class `AiChat`) — this is the reference implementation to port real behavior from:**
    - `AiReportService.sendMessage(msg)` → `POST /v2/chatbot/chat`; the bot's reply is passed through **`marked.parse(res.reply)`** (converting Markdown to HTML) before being stored/rendered — meaning real bot responses are Markdown-formatted and need sanitized HTML rendering. React equivalent: `marked` (already proven to work, same library) + `DOMPurify` for sanitization before `dangerouslySetInnerHTML`, or `react-markdown`.
    - Full chat-history feature: `getAllChatHistory()` (`GET /v2/chatbot/sessions`) populates a session list; `openChatHistory(sessionId)` (`GET /v2/chatbot/history/{sessionId}`) reconstructs messages, **defensively normalizing heterogeneous field names**: `item.role || item.sender || item.type` and `item.message || item.content || item.text || item.reply`. This defensive normalization pattern should be preserved if the backend's historical record shape is genuinely inconsistent — **UNKNOWN — REQUIRES VERIFICATION** whether this defensiveness reflects a real backend inconsistency or leftover caution; ask backend team if unsure.
    - `showHistory`/`historyLoading` signals drive a history side-panel toggle.
  - **Migration recommendation:** build the React AI Dashboard by porting `ai-chat.component.ts`'s real behavior (API call, markdown rendering, history panel) into the nicer visual shell/styling of the enterprise `ai-dashboard` page — the two together represent the feature's intended finished state.

---

### FEATURE: Settings
- **Angular route:** `/enterprise/settings`
- **Component(s):** `Settings` — `pages/settings/settings.{ts,html,scss}`
- **Services used:** **none — entirely mocked, no API calls, no persistence.**
- **API endpoints used:** none.
- **Models/interfaces used:** `ToggleSetting { label, checked }`, `NotificationSetting { title, enabled }` — two parallel structures holding the same 5 conceptual settings (Daily attendance SMS, Payment approval emails, WhatsApp login credentials, AI risk alerts, Weekly expense digest). This duplication looks like leftover refactor debris — **before porting, read `settings.html` to determine which of the two structures the template actually renders**, and only port that one.
- **Guards/permissions:** `RoleGuard` (`ENTERPRISE`)
- **Child components:** none.
- **Dialogs/modals:** none.
- **Validation:** none.
- **Important business logic:**
  - Static company profile fields (`companyName`, `gstin`, `headOffice`, `contactNumber`) — **UNKNOWN — REQUIRES VERIFICATION** whether these are editable (`[(ngModel)]`) or read-only interpolation; confirm by reading `settings.html` before implementing the React form.
  - Handlers `onToggleChange()`, `onToggle()`, `onChangePassword()`, `onEnable2FA()`, `onManageSessions()`, `onRevokeSessions()` are **all `console.log` stubs only** — no real backend security/session-management calls exist yet. There is no real settings feature to port; this is a UI shell awaiting backend wiring in either codebase.

---

## 10. Dependency Map

From `package.json` — dependencies relevant to the desktop application:

| Package | Version | Used for | React/Vite equivalent |
|---|---|---|---|
| `@angular/cdk`, `@angular/material` | `^20.2.14` / `~20.2.14` | Material tables/dialogs/form fields — **only** in legacy `dashboard/employer/reports/**` and `super-admin-dashboard/**`, **not** used anywhere in `enterprise-user/pages/**` | Not needed for the primary in-scope pages; if porting the legacy employer surface too, consider MUI or a headless table library (TanStack Table) |
| `@fortawesome/fontawesome-free` | `^7.3.1` | Plain CSS icon classes (`<i class="fa-solid fa-...">`) throughout `enterprise-user` templates — no dynamic icon-name binding observed | Import the same CSS package directly in Vite (`import '@fortawesome/fontawesome-free/css/all.min.css'`), or migrate to `react-icons`/`@fortawesome/react-fontawesome` — a straight CSS-class port is simplest since usage is static |
| `apexcharts` + `ng-apexcharts` | `^5.16.0` / `^2.4.0` | All charts in enterprise Dashboard (4) and Expense Tracker (2, currently mocked) — typed Apex* option objects (`ApexAxisChartSeries`, `ApexChart`, `ApexXAxis`, etc.) | `react-apexcharts` (same underlying `apexcharts` engine) — chart option objects are plain JS/TS and port almost verbatim |
| `marked` | `^16.4.2` | Real usage only in `dashboard/employer/ai-chat` — `marked.parse(text)` to render bot Markdown replies to HTML | Same library works identically in React; pair with `DOMPurify` before `dangerouslySetInnerHTML`, or consider `react-markdown` |
| `ngx-markdown` | `^20.1.0` | Registered globally (`provideMarkdown()`); consumed via a markdown component/directive in employer ai-chat (possibly), employer attendance, blog-detail, and several super-admin components | `react-markdown` + `remark`/`rehype` plugins, or just standardize on `marked` (already proven in ai-chat) for consistency |
| `xlsx` (SheetJS) | `^0.18.5` | Genuine **client-side** usage found in exactly one place: `super-admin-dashboard/components/user-table/user-table.component.ts` `exportToExcel()`, using `const XLSX = require('xlsx')` (CommonJS `require` inside an ES module — will need `import * as XLSX from 'xlsx'` in Vite). **Everywhere else**, `.xlsx`/`.pdf` "exports" (Attendance, Payments, employer Reports) are server-generated blobs streamed via `postBlob()` — the client only creates an object URL and clicks a synthetic `<a>`; no `xlsx` library involvement needed for those. | Same `xlsx` package works in Vite with standard ESM import; the blob-download features need no charting/spreadsheet library at all, just a `downloadBlob()` helper (see §15) |
| `rxjs` | `~7.8.0` | Standard `Observable`-returning `HttpClient` calls throughout; no complex operator chains beyond basic `tap`/`map`/`switchMap`/`catchError` were found — nothing reactive-stream-heavy that would resist a query-library port | TanStack Query, SWR, or plain `fetch` + hooks — no RxJS-specific behavior needs to be preserved |
| `tslib` | `^2.3.0` | TypeScript helper runtime | N/A (Angular build detail) |

Not relevant to the desktop app / dev-only (not needed in the React port): `@angular/cli`, `@angular/build`, `@angular/compiler(-cli)`, `karma*`, `jasmine*`.

---

## 11. Environment Variables / Configuration

Only one environment file exists in this repo: `src/environments/environment.ts` (no `environment.prod.ts` / `environment.development.ts` found — **UNKNOWN — REQUIRES VERIFICATION** whether `angular.json` performs any file replacement for production builds; if not, production uses this same file as-is).

```ts
export const environment = {
    production: false,
    apiBaseUrl: 'https://api.kametgroup.com/api',
    authKey: '23$gasdt37gas62dg$hgsf79fhckkl6',
    strapiUrl: 'https://kaamsaathi-cms.onrender.com',
    enterpriseapiBaseUrl: 'http://43.204.170.108:9091/api',
    encryptionkey: '0e+NFRNUKZVHLSO+FG6ABm7ErL9oR62NuDJUvztDSZw='
};
```

- **`apiBaseUrl`** — primary REST API base for nearly all endpoints in §5.
- **`enterpriseapiBaseUrl`** — a second base URL (raw IP:port), selectively used depending on the (inconsistently-applied) enterprise flag described in §6 — this inconsistency must be resolved deliberately, not silently ported.
- **`authKey`** — a static shared-secret string sent as the `authKey` header on every non-Strapi request (see §5 `authInterceptor`). This is a hardcoded secret checked directly into source control.
- **`strapiUrl`** — Strapi CMS base for public/marketing content; requests to this URL explicitly skip the app's auth header injection.
- **`encryptionkey`** — base64 AES-256 key for the currently-**dormant** `EncryptionService`/`encryptionInterceptor` (see §5). Not actively used in production traffic today, but the plumbing exists.

**For the React/Vite port:** these map naturally to `import.meta.env.VITE_*` variables. Since `authKey` and `encryptionkey` are already baked into a public client bundle (providing no real security today), equivalent Vite env vars are fine for parity, but flag to the team that true secrets should be rotated/moved server-side regardless of framework. **Two distinct API base URLs must be preserved** as configuration — but the React port should implement the "which backend to hit" decision explicitly and correctly per-endpoint (see §6), not reproduce the Angular app's inconsistent flag behavior.

---

## 12. Storage / Token Behavior

- **`StorageService`** (`storage.service.ts`) is a thin `localStorage` wrapper: **every value, including plain strings, is JSON-stringified on write and JSON-parsed on read** (`localStorage.setItem(key, JSON.stringify(value))`). This means, e.g., `user_role` is stored literally as the string `"ENTERPRISE"` (with quote characters) rather than `ENTERPRISE`. If the React port reads these same keys during any transition period, it must JSON-parse them; a fresh React app doesn't need to replicate this quirk unless sharing localStorage with the Angular app during a phased rollout.
- **`TokenService.setLoginData(res)`** stores these `localStorage` keys after a successful login (all via the wrapper above):
  | Key | Source | Notes |
  |---|---|---|
  | `access_token` | `res.accessToken` | |
  | `refresh_token` | `res.refreshToken` | **Stored but never read anywhere** — no refresh flow exists |
  | `user_role` | `res.role` | Single flat role string — see §4 |
  | `user_id` | `res.id` | |
  | `parent_id` | `res.id` | **Same value as `user_id`** — used as "leaderId"/"parentId" across the app for subordinate-scoped queries |
  | `username` | `res.username` | |
  | `mobilenumber` | `res.mobileNumber` | |
  | `plan_id` | `res.planId` | |
- **Accessors:** `getAccessToken()`, `getRole()`, `getUserId()`, `getUserName()`, `getParentId()`, `getPlanId()`, `getPhoneNumber()` — all simple passthrough reads.
- ⚠ **`setPlan(planid)`** writes directly via raw `localStorage.setItem(this.PLAN_KEY, ...)` bypassing `StorageService` — but `PLAN_KEY` is an **empty string**, so this method is **broken/a no-op today** (it writes to the key `''`). Do not port this bug into React; if plan-setting needs to work, it needs a real key.
- **`clearTokens()`** → `StorageService.clear()` → **`localStorage.clear()`**, which **wipes the entire origin's localStorage**, not just the app's own keys. Used by `AuthService.logout()`. ⚠ **If any other app/tool shares this origin's localStorage, logging out of KaamSaathi would wipe its data too.** Recommend the React port scope its logout to only the app's own known keys (or a namespaced prefix) rather than reproducing a blanket `localStorage.clear()`.
- **No `sessionStorage` usage** was found anywhere in the codebase.
- **No client-side token expiry check** and **no refresh-token cycle**: a token is trusted purely by its presence in `localStorage`. If the backend rejects an expired token, no interceptor currently reacts to force logout (see §5, `authInterceptor` has a commented-out, never-activated 401 handler). **Recommend building this properly in React** rather than reproducing the gap, unless the team wants strict behavioral parity during a transition period.

---

## 13. Validation Rules

| Feature | Field | Rule |
|---|---|---|
| Login (password) | `mobileNumber` | required, pattern `^[6-9][0-9]{9}$` |
| Login (password) | `password` | required |
| Login (forget-password) | password match | custom cross-field validator exists but is **broken** — wired to keys `password`/`confrmPassword` while the actual controls are `ppassword`/`cconfrmPassword`, so it never actually fires. Decide whether to fix or preserve for parity. |
| User Management | `name` | required |
| User Management | `mobileNumber` | required, pattern `/^[6-9]\d{9}$/` |
| User Management | `role` | required |
| User Management | `site_id` | required |
| Site Management | `siteName` | required |
| Site Management | `address` | required |
| Site Management | `pinCode` | pattern `/^\d{6}$/` only — **not required** (only checked if a value is entered) |

No other forms exist in the in-scope `enterprise-user` feature set (Attendance, Payments, Expense Tracker, Reports, AI Dashboard, Settings pages have no forms beyond filter dropdowns/date inputs, which carry no formal validation).

---

## 14. Important Business Rules (do not lose these during migration)

1. **Attendance/Payments group→flat-row transformation** (§7, §9): backend returns site-grouped data with nested `rows`; the UI flattens this into per-worker rows, denormalizing site/manager info onto each row, with specific fallback chains for missing names. This must be reproduced exactly if the backend contract is unchanged.
2. **Payment status normalization** (`mapPaymentStatus`): `'PAID'`→`'Paid'`, `'PARTIAL'|'PARTIALLY_PAID'`→`'Partial'`, else→`'Pending'`.
3. **`totalLabourCost` sums `dailyWage`, not `earnings`** — flagged because an earlier, now-dead, commented-out version of the same code summed `earnings` instead. Confirm with the business which figure is actually correct before finalizing the React version, since this is a headline financial number.
4. **Date-range validity check** for Attendance/Payments refetch and export: both start and end date must be set, and `start <= end` via plain ISO string comparison (works because `YYYY-MM-DD` sorts lexicographically) — preserve this exact input-gating behavior.
5. **`active` field on `User` is numeric (`0|1`), not boolean** — preserve the type if the backend contract expects a number.
6. **`RoleGuard`'s dead `'ENTERPRISE'` case** (§4): a real bug causing enterprise users to be misrouted to `/dashboard/user/home` on certain failed role checks. **This is a decision point, not just a note** — explicitly decide with the team whether the React router logic should reproduce this bug (for a phased, behavior-frozen migration) or fix it (recommended for a clean rebuild), and document the choice.
7. **`ApiService`'s enterprise-flag inconsistency** (§6): several enterprise-page API calls silently hit the wrong backend today (GET always ignores the flag; DELETE has no flag at all; some POST/PUT calls on the same page pass the flag inconsistently). This affects User Management (all 4 CRUD calls) and Site Management (create vs. edit). **Confirm the intended backend for each call with the backend team before wiring the React version** — do not assume today's behavior is the intended behavior.
8. **Which pages are real vs. mocked** (critical for scoping the migration effort): Dashboard is partially real (3 stat groups) and partially mocked (all 4 charts, AI insights, quick actions). User Management and Site Management are fully real (CRUD works, modulo the flag bug above). Attendance and Payments are fully real (fetch + export). **Expense Tracker, Reports, AI Dashboard, and Settings are entirely mocked/static in the enterprise surface** — their real reference implementations live in `dashboard/employer/expense-tracker`, `dashboard/employer/reports`, and `dashboard/employer/ai-chat` respectively (Settings has no real implementation anywhere in this codebase).
9. **Site Management has no working delete** — the UI stub exists but no backend method is wired up on either the frontend service or (as far as this inspection could determine) presumably the backend either. Do not assume a delete endpoint exists without checking with backend.
10. **User Management's `toggleStatus` does not persist** — it's a local-only UI toggle with no backend call. Same caution as above.

---

## 15. Error / Loading / Notification Behavior

- **Loading:** no global loading indicator or interceptor-driven state. Every page manages its own local `loading` boolean/signal, set before a call and cleared in the response/error handler. The shared `Loader` component (`shared/components/loader/loader.ts`) is a bare presentational spinner not wired to any central state — some employer-side pages import it manually. **Recommend the React port use a query library's built-in `isLoading`/`isFetching` state** rather than reproducing manual per-page loading booleans, though the *visual* pattern (a spinner shown while a specific section loads, not a full-page blocker) should be preserved since that's the actual UX today.
- **Errors:** inconsistent. Most pages `console.error` the failure and/or set a local `error` string signal shown inline. **User Management uses raw browser `alert()`** for both success and failure feedback on add/edit. `EnterpriseService.registerEnterprise()` also uses raw `alert('Register Successfully')`. The `SnackbarService` (wrapping `MatSnackBar`, with `.success()`/`.error()` methods, distinct styling/timing already defined — 4s for errors, 8s for success, bottom-right position) **exists and is well-formed but is barely used** — most of the app doesn't call it. **Recommend the React port design one consistent toast/notification pattern from scratch** (e.g. a single toast provider) and use it everywhere, rather than reproducing the current inconsistency of `alert()` vs. console-only vs. the underused snackbar service.
- **No centralized API-response-envelope handling** exists (the one attempt, `response-mapper.service.ts`, is entirely commented out and dead). Every page manually checks `res.status === 'SUCCESS'` (or, inconsistently, `res.subordinates` truthiness — see §7) inline. **Recommend building a single typed API client/hook layer in React that normalizes success/failure and can trigger toasts centrally**, since the Angular app never got around to this and paid for it with scattered, inconsistent boilerplate.
- **No 401/expired-token handling** exists anywhere (see §12) — this is an error-handling gap, not a preserved pattern; consider fixing it in React.

---

## 16. Recommended React Architecture

*(Recommendation, not inspected fact — evaluate against your team's existing conventions.)*

- **Routing:** React Router (or TanStack Router) with a route tree mirroring §2's `enterprise-user` structure: an authenticated `/enterprise` layout route (sidebar + header persistent shell, matching `SA-aside`/`SA-header`) with 9 child routes. Decide once, deliberately, whether to lazy-load each page individually (`React.lazy()` per page — an improvement over the current Angular app) or as one bundle (parity with today's eager-import-inside-lazy-chunk pattern).
- **State/data-fetching:** TanStack Query (or SWR) per API call, replacing ad hoc `loading`/`error` signals and manual RxJS subscriptions. This also gives you `isLoading` for free (see §15) and a natural place to centralize response-envelope handling (§14 point 7, §15).
- **API client:** one typed client module per base URL (`apiBaseUrl`, `enterpriseapiBaseUrl`) — or one client with an explicit, always-respected `target` parameter — fixing the flag inconsistency described in §6/§14 rather than reproducing it. Attach the static `authKey` header and `Authorization: Bearer <token>` centrally (mirroring `authInterceptor`), and explicitly decide whether to add real 401 handling (recommended) or the encryption layer (`EncryptionService` logic is portable as-is via Web Crypto, currently dormant — decide if it should be turned on in the new app or left out).
- **Auth/session state:** a small auth context or store (Zustand/Redux/Context) reading from a namespaced `localStorage` (not a blanket-clear pattern — see §12) — store the same fields (`accessToken`, `role`, `userId`, `parentId`, `username`, `mobileNumber`, `planId`), but as real typed values, not JSON-double-encoded strings.
- **Authorization:** a route-guard wrapper component (or router loader) reproducing the *intended* behavior of `AuthGuard`+`RoleGuard` — recommend fixing the two bugs found (§4) rather than porting them, and document that decision.
- **Forms:** React Hook Form + a schema validator (Zod/Yup) reproducing the rules in §13 exactly (including the intentionally-optional `pinCode` pattern-only rule).
- **Charts:** `react-apexcharts`, porting the existing Apex* option objects near-verbatim from the Dashboard and Expense Tracker components.
- **Markdown rendering (AI chat):** `marked` (same library, proven to work in the existing `ai-chat` component) + `DOMPurify` before rendering, or `react-markdown`.
- **File downloads:** one shared `downloadBlob(blob, filename)` utility (see §9/Attendance, Payments) replacing the ~4+ duplicated instances of the manual `URL.createObjectURL` + synthetic `<a>` idiom.
- **Notifications:** one toast provider (e.g. `sonner`, `react-hot-toast`, or a custom context) used consistently everywhere, replacing the mix of `alert()`/`console`/unused-snackbar-service.
- **Icons:** keep FontAwesome as a plain CSS import (`@fortawesome/fontawesome-free/css/all.min.css`) given usage is 100% static CSS classes — no need to adopt a React-specific icon library unless there's a broader design-system reason to.

---

## 17. Recommended Migration Order

1. **Foundation first:** API client layer (with the enterprise-flag bug fixed deliberately, §6/§14), auth/token storage & context, route guards, and the persistent shell layout (header + sidebar) — nothing else can be meaningfully tested without these.
2. **Read-only, fully-real features next** (lowest risk, validates the foundation end-to-end): **Attendance** and **Payments** — both are already fully API-driven with no forms, just fetch/filter/export. Good smoke test for the API client, auth headers, and the blob-download utility.
3. **CRUD features with real backends:** **User Management** and **Site Management** — exercise forms, validation, and mutations. Use this stage to resolve the enterprise-flag inconsistencies (§6/§14) with the backend team, since these two features are where the bug is most visible.
4. **Dashboard** — mix of real (3 stat groups, straightforward) and mocked (4 charts, AI insights, quick actions). Wire the real parts first; treat the mocked visualizations as new design/product work, not a "port" (there's no real logic behind them to preserve — see §9).
5. **Features requiring cross-porting from the legacy `dashboard/employer/**` reference implementations** (highest effort, since real logic lives in different files than the ones matching the target routes): **Expense Tracker** (port from `dashboard/employer/expense-tracker`), **AI Dashboard** (port from `dashboard/employer/ai-chat`), **Reports** (port from `dashboard/employer/reports/**`). Do these after the team is comfortable with the API/auth/forms foundation, since each requires reading a *different* component than the one whose route/UI you're replicating.
6. **Settings last** — there is no real implementation anywhere in the codebase to port (§9); this is greenfield product work scoped by the business, not a migration task per se.

---

## 18. Known Risks

- **Silent wrong-backend calls** (§6, §14 point 7): User Management and Site Management currently read/write across two different API base URLs inconsistently depending on the specific action. If this isn't resolved *before* the React port ships, the new app could either (a) faithfully reproduce a confusing bug, or (b) "fix" it and accidentally start hitting a different backend than QA/stakeholders are used to seeing — either way, this needs an explicit decision with the backend team, not a silent choice by whoever implements the page.
- **Financial figure ambiguity**: `totalLabourCost` on the Payments page sums `dailyWage` today, but a dead commented-out version summed `earnings` — get sign-off on which is correct before it ships in a new app, since it's a headline number stakeholders will scrutinize.
- **Broken/missing features masquerading as working UI**: Site Management's delete button, User Management's status toggle, and the entire Settings page all *look* interactive but do nothing real. If migrated as "port the UI faithfully," these will ship as broken/fake features again unless explicitly flagged to product as needing real implementation.
- **Fully mocked pages presented as if real**: Expense Tracker, Reports, and AI Dashboard in the enterprise surface are demo-quality mock UIs with zero backend wiring. Estimating migration effort as "just port this page" would badly under-scope the actual work, which is closer to "build this feature for real, using a different, older component as a logic reference." Make sure whoever estimates the React work understands this before committing to timelines.
- **Auth/session robustness gaps**: no token refresh, no expiry handling, no scoped logout (blanket `localStorage.clear()` could affect unrelated apps on the same origin). These are pre-existing production risks in the Angular app, not migration risks per se, but a "faithful port" would carry them into the new app unless explicitly addressed.
- **Role-based misrouting bug** (`RoleGuard`'s dead `'ENTERPRISE'` case, §4): could cause visible, confusing navigation behavior for enterprise customers today; worth confirming whether this has already been reported/tolerated in production before deciding whether the React app should "fix" it (which changes observed behavior) or match it.
- **Unverified payment gateway integration** (`PricingService.createOrder`/`verifyPayment`, §5): pattern suggests a real payment gateway is involved, but this wasn't confirmed by direct inspection and is outside the primary named feature list — if pricing/plans are ever in scope, this needs dedicated verification before implementation, given real money is involved.

---

## 19. Things That Require Manual Verification

The following items are marked `UNKNOWN — REQUIRES VERIFICATION` throughout this document; collected here for convenience:

- [ ] Exact full shape/typing of the login `LoginResponse` object from the backend (field names/casing) — confirm against a live API call before hardcoding a React type.
- [ ] Whether `angular.json` performs any environment file replacement for production builds, or whether `environment.ts` (with its checked-in secrets) truly is what ships to production as-is.
- [ ] Exact field names in `AmountResponse`, `Category`, `Transaction` (`dashboard/employer/expense-tracker/type/expense-tracker.types.ts`) — read the file directly before implementing the real Expense Tracker.
- [ ] What `payments.html`'s `activeTab` (`All`/`Site-wise`/`Site Manager-wise`) actually changes in rendering/grouping — no branching logic was found in the `.ts` file.
- [ ] Whether `settings.html` renders `ToggleSetting[]` or `NotificationSetting[]` (both exist redundantly in `settings.ts`) — port only the one actually used.
- [ ] Whether Settings' company profile fields (`companyName`, `gstin`, `headOffice`, `contactNumber`) are meant to be editable or are read-only display — check the template.
- [ ] Whether a real activate/deactivate endpoint exists on the backend for User Management's `toggleStatus` (none was found client-side).
- [ ] Whether a real delete-site endpoint exists on the backend for Site Management (no client-side method exists, and the UI is a stub).
- [ ] Which payment gateway/SDK backs `PricingService.createOrder`/`verifyPayment` — check `pricing.component.ts` directly; only relevant if Pricing/Plans is added to migration scope later.
- [ ] Exact Strapi CMS endpoints used by `BlogService`, and whether the static-pages/blog area is in scope for this migration at all (not named in the original feature list).
- [ ] Whether `super-admin-pricing.service.ts` is genuinely unused dead code or thin/re-exporting — only relevant if the super-admin surface is later added to migration scope.
- [ ] Whether the `attendance.spec.ts` test scaffold (enterprise Attendance page) contains meaningful assertions worth porting, or is just default Angular boilerplate.
- [ ] Whether the historical chat-record field-name inconsistency handled defensively in `ai-chat.component.ts`'s `openChatHistory()` reflects a genuine, ongoing backend inconsistency (keep the defensive normalization) or stale leftover code (safe to simplify) — ask the backend team.
- [ ] Business confirmation of whether `Payments.totalLabourCost` should sum `dailyWage` (current active code) or `earnings` (dead commented-out alternative) — this is a stakeholder-facing financial figure.
- [ ] Explicit team decision (not a technical unknown, but requires a decision, not silent code choice) on whether to reproduce or fix: (a) `RoleGuard`'s dead `'ENTERPRISE'` branch, (b) the forget-password cross-field validator's key mismatch, (c) `ApiService`'s inconsistent enterprise-flag handling across GET/POST/PUT/DELETE, (d) OTP-login's hardcoded (non-`getRedirectRoute`) navigation.

---

## Migration Checklist

### Foundation
- [ ] Set up Vite + React + TypeScript project structure
- [ ] Configure `VITE_API_BASE_URL`, `VITE_ENTERPRISE_API_BASE_URL`, `VITE_AUTH_KEY` (and any others) as env vars, sourced from `src/environments/environment.ts`
- [ ] Implement a typed API client (or two, one per base URL) with a correctly, consistently applied "which backend" selection per endpoint (resolve the bug in §6/§14 point 7 — do not silently port it)
- [ ] Implement auth/session state (context or store) backed by `localStorage`, storing `accessToken`, `role`, `userId`, `parentId`, `username`, `mobileNumber`, `planId` as real typed values
- [ ] Implement scoped logout (clear only this app's own keys — do not reproduce the blanket `localStorage.clear()` from §12)
- [ ] Implement route guards reproducing (or deliberately fixing, per team decision) `AuthGuard`/`RoleGuard` logic from §4
- [ ] Build the persistent shell layout: header (profile dropdown, sign-out) + sidebar (9 nav items, matching `SA-header`/`SA-aside`)
- [ ] Set up a shared toast/notification provider (replacing the `alert()`/console/unused-snackbar-service inconsistency, §15)
- [ ] Build a shared `downloadBlob(blob, filename)` utility (replacing the duplicated blob-download idiom, §9/§15)
- [ ] Decide and document: reproduce or fix each bug listed in §19's last checklist item

### Auth
- [ ] Implement password login (mobile pattern `^[6-9][0-9]{9}$`, required password)
- [ ] Implement OTP login (send/verify), deciding whether to fix its hardcoded non-`getRedirectRoute` navigation
- [ ] Implement forget-password flow, deciding whether to fix the broken cross-field validator
- [ ] Implement enterprise self-registration (replacing native `alert()` with the new toast provider)
- [ ] Implement role-based post-login redirect matching `getRedirectRoute()`'s switch logic

### Attendance (real, fully API-driven)
- [ ] Fetch + flatten group→row transformation (§7, §9)
- [ ] Date-range filter with `start <= end` gating
- [ ] Client-side filters (site/manager/role) and summary tiles
- [ ] PDF/Excel export via blob download

### Payments (real, fully API-driven)
- [ ] Fetch + flatten group→row transformation with fallback chains
- [ ] `mapPaymentStatus` normalization (exact mapping)
- [ ] Aggregate tiles — confirm `totalLabourCost` basis with business first (§18)
- [ ] Client-side filters and `statusClass` badge mapping
- [ ] PDF/Excel export via blob download
- [ ] Verify what the `activeTab` control should do (§19)

### User Management (real, with a known bug to resolve)
- [ ] List/create/edit/delete against the correct, resolved backend per §6
- [ ] Form validation matching §13 exactly
- [ ] Client-side name/mobile/site search + role filter
- [ ] Decide whether `toggleStatus` should call a real endpoint or remain cosmetic (confirm with backend, §19)

### Site Management (real, with a known gap)
- [ ] Create/edit against the correct, resolved backend per §6
- [ ] Form validation matching §13 exactly (note `pinCode` is optional-but-pattern-checked)
- [ ] Decide whether to implement real delete (no backend method currently exists, §14 point 9)
- [ ] Client-side search/filter

### Dashboard (partially real)
- [ ] Wire the 3 real stat groups (site-summary, worker-attendance-summary, monthly-finance-summary)
- [ ] Treat all 4 charts, AI insights, and quick actions as new product/design work, not a straight port (§9, §17)

### Expense Tracker (fully mocked in enterprise surface — port real logic from `dashboard/employer/expense-tracker`)
- [ ] Read and port `ExpenseTrackerService` usage from the employer component
- [ ] Confirm exact `AmountResponse`/`Category`/`Transaction` field shapes before implementing (§19)
- [ ] Apply the real data flow inside the enterprise page's existing visual design

### Reports (fully mocked in enterprise surface — port real logic from `dashboard/employer/reports/**`)
- [ ] Read and port `ReportService` usage (attendance + payment report generation)
- [ ] Confirm with backend whether to preserve or fix the `AttandanceReport` typo and `?siteId=' '` querystring bug
- [ ] Apply the real data flow inside the enterprise page's existing visual design

### AI Dashboard (fully mocked in enterprise surface — port real logic from `dashboard/employer/ai-chat`)
- [ ] Read and port `AiReportService` usage (send message, sessions, history)
- [ ] Implement Markdown rendering of bot replies (`marked` + sanitization, or `react-markdown`)
- [ ] Implement chat history panel with defensive field-name normalization (confirm necessity per §19)
- [ ] Apply the real data flow inside the enterprise page's existing visual design

### Settings (no real implementation exists anywhere — greenfield)
- [ ] Scope this as new product work with the business, not a migration task
- [ ] Confirm which of the two duplicate toggle structures (if either) should inform the new design

### Final QA
- [ ] Cross-check every migrated feature's API calls against §5's endpoint table for correctness
- [ ] Confirm no secrets are shipped insecurely beyond what the current app already does (or improve on it, per team decision)
- [ ] Verify session/auth behavior (login, logout, guard redirects) matches the team's chosen behavior from §19's decision checklist
