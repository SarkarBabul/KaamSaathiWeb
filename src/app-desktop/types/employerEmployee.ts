// Field names verified directly against the Angular Employer surface
// (features/dashboard/employer/employee-management/**) — the *legacy but
// functionally complete* employer tree, not enterprise-user. This is a
// richer record than Enterprise User Management's `EnterpriseUser`: the
// employer Add/Edit forms collect isGeneratedMobile, rate, aadharNumber,
// parentName and panNumber as first-class fields (list-employee.component
// .html reads every one of them), where Enterprise's simplified form never
// touches most of them. Both features query the same `/v2/getSubordinate`
// endpoint against the same backend records, so the two types describe the
// same wire shape from two different UIs' point of view — kept separate
// per Phase 4B's brief to preserve a clean domain boundary rather than
// growing one shared "any employee" type two unrelated pages depend on.
export interface EmployerEmployeeRecord {
  id: number;
  name: string;
  mobileNumber: string | null;
  isGeneratedMobile: boolean;
  roleId: string;
  // Live-observed: unassigned/legacy records can carry a null role or site
  // name (e.g. "Test Leader 2"/"Test Leader 3" render a null siteName) —
  // not guaranteed non-null despite every populated record having one.
  roleName: string | null;
  siteId: number;
  siteName: string | null;
  rate?: number | string | null;
  aadharNumber?: string | null;
  parentName?: string | null;
  panNumber?: string | null;
}

// The live `getSubordinate` response envelope (list-employee.component.ts's
// `getEmployees()`: `res.status === 'SUCCESS' && res.subordinates`).
export interface EmployerEmployeesResponse {
  status: "SUCCESS" | "FAILURE" | string;
  subordinates?: EmployerEmployeeRecord[];
}

// add-employee.component.ts `addEmployee()`: only the fields the user
// actually filled in are sent — dailyWage/parentname/pancard/aadharNumber
// are omitted entirely (not sent as null/"") when left blank, and
// mobileNumber is omitted entirely when isGeneratedMobile is true. Role and
// site_id are always required. parentUserId is service-injected from the
// authenticated session, never a user-editable field.
export interface AddEmployeePayload {
  name: string;
  role: string;
  site_id: number;
  isGeneratedMobile: boolean;
  parentUserId: string;
  mobileNumber?: string;
  rate?: number;
  parentName?: string;
  panNumber?: string;
  aadharNumber?: string;
}

export interface AddEmployeeResponse {
  status: "SUCCESS" | "FAILURE" | string;
  statusCode?: string;
  message?: string;
  statusMsg?: string;
}

// master-data.service.ts `getRoles()`: POST /v2/getAllRoles, no body,
// target `default` (no isEnterprise flag is ever passed for this call).
// The live response's `id` is a JSON number — normalized to string by
// useEmployerRoles() below, since getSubordinate's own `roleId` field is a
// string and the two must compare equal for a Select to preselect it.
export interface EmployerRole {
  id: string;
  roleName: string;
}

export interface RawEmployerRole {
  id: number;
  roleName: string;
}

export interface RolesResponse {
  data?: RawEmployerRole[];
}

// employee-management.service.ts `getAssignStatus()`: GET
// /v2/{parentId}/assignment-status, target `default`. Gates the Add
// Employee submit — checked in add-employee.component.ts's `submit()`
// before ever calling addEmployee, and only when `withinLimit` is false
// does the Angular UI surface the plan/limit popup instead of creating.
export interface AssignStatus {
  withinLimit: boolean;
  planName?: string;
  workerLimit?: number;
  assignedCount?: number;
}

export interface AssignStatusResponse {
  data?: AssignStatus;
}
