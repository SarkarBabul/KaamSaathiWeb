import { api } from "@/app-desktop/api/httpClient";
import type {
  AddEmployeePayload,
  AddEmployeeResponse,
  AssignStatusResponse,
  EmployerEmployeesResponse,
  RolesResponse,
} from "@/app-desktop/types/employerEmployee";

// Every call below targets `default` — verified from
// employee-management.service.ts and master-data.service.ts, where the
// employer surface always calls with `isEnterprise` left at its default
// `false` (unlike enterprise-user's edit/create calls, which pass `true`).
const TARGET = "default" as const;

export function getEmployerEmployees(parentId: string) {
  return api.post<EmployerEmployeesResponse>(TARGET, "/v2/getSubordinate", { parentId });
}

export function addEmployerEmployee(payload: AddEmployeePayload) {
  return api.post<AddEmployeeResponse>(TARGET, "/v2/addSubordinate", payload);
}

export function getEmployerRoles() {
  return api.post<RolesResponse>(TARGET, "/v2/getAllRoles");
}

export function getAssignStatus(parentId: string) {
  return api.get<AssignStatusResponse>(TARGET, `/v2/${parentId}/assignment-status`);
}
