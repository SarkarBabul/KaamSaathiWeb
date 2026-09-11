import { api } from "@/app-desktop/api/httpClient";
import type {
  AddSubordinatePayload,
  AddSubordinateResponse,
  DeleteSubordinateResponse,
  EditSubordinatePayload,
  EditSubordinateResponse,
  SubordinatesResponse,
} from "@/app-desktop/types/userManagement";

// VERIFIED FROM LIVE NETWORK (USER_MANAGEMENT_API_VERIFICATION.md §18.4):
// the live enterprise User Management page's list request is
// POST /v2/getSubordinate against api.kametgroup.com (Angular's `default`
// apiBaseUrl), body { parentId }. This is the only user-list contract that
// has been exercised end-to-end by the real app.
//
// addSubordinate/editSubordinate/permanentDeleteSubordinate below are all
// target `default` too — LIVE-VERIFIED by an explicitly user-authorized
// mutation test (§27 create, §28 edit; delete was the cleanup step for
// both). This resolved the prior default-vs-enterprise /
// site_id-vs-siteId / id-vs-userId ambiguity in favor of the
// cross-client-consensus shape (matching the legacy Angular `employer`
// tree and the independent Flutter app), not the live `enterprise-user`
// route's `enterprise`/`siteId`/`userId` variant.
const TARGET = "default" as const;

export function getSubordinates(parentId: string) {
  return api.post<SubordinatesResponse>(TARGET, "/v2/getSubordinate", { parentId });
}

// §27: { name, role: "supervisor", site_id, isGeneratedMobile: true,
// parentUserId } → HTTP 200, status "SUCCESS", statusCode "ADD_SUB_200".
// No mobileNumber is sent — isGeneratedMobile:true was confirmed to work
// with no phone number in the payload at all.
export function addSubordinate(payload: AddSubordinatePayload) {
  return api.post<AddSubordinateResponse>(TARGET, "/v2/addSubordinate", payload);
}

// §28: the exact legacy edit-elist.component.ts payload shape — { id,
// name, mobileNumber, aadharNumber, site_id, role, rate, parentName,
// panNumber } → HTTP 200, status "SUCCESS", statusCode "EDIT_SUB_200",
// confirmed to rename the existing record in place (not duplicate it).
export function editSubordinate(payload: EditSubordinatePayload) {
  return api.post<EditSubordinateResponse>(TARGET, "/v2/editSubordinate", payload);
}

// §9/§27 cleanup step: { id } → HTTP 200, status "SUCCESS". Implemented
// per the verified contract; intentionally not wired to any UI action —
// the live Angular enterprise page's own template has its Delete menu
// item commented out, and this port preserves that (see UserManagement.tsx).
export function deleteSubordinate(id: number) {
  return api.post<DeleteSubordinateResponse>(TARGET, "/v2/authenticate/permanentDeleteSubordinate", { id });
}
