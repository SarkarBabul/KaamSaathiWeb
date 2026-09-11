// Field names verified directly against the live Angular source
// (enterprise-user/pages/user-management/user-management.ts, the `User`
// interface) and the live network response captured from
// POST /v2/getSubordinate. No field is invented or guessed.
export interface EnterpriseUser {
  id: number;
  name: string;
  mobileNumber: string;
  roleId: string;
  roleName: string;
  siteId: number;
  siteName: string;
  active: number;
  // Optional legacy fields carried by the exact editSubordinate payload
  // shape live-verified in USER_MANAGEMENT_API_VERIFICATION.md §28 (the
  // legacy edit-elist.component.ts structure: id, name, mobileNumber,
  // aadharNumber, site_id, role, rate, parentName, panNumber). Not
  // collected by this app's Add/Edit form and not guaranteed present on
  // every record — read through unchanged from whatever getSubordinate
  // actually returns, never fabricated, so edit can preserve them as-is.
  aadharNumber?: string | null;
  rate?: number | string | null;
  parentName?: string | null;
  panNumber?: string | null;
}

// The live `getSubordinate` response envelope, verified from Angular's
// `getEmployees()` handling (`res.status === 'SUCCESS' && res.subordinates`)
// and corroborated by the Flutter client (§8 of the verification doc).
export interface SubordinatesResponse {
  status: "SUCCESS" | "FAILURE" | string;
  subordinates?: EnterpriseUser[];
}

// LIVE-VERIFIED (USER_MANAGEMENT_API_VERIFICATION.md §27): a real
// POST /v2/addSubordinate request with this exact 4-key shape (plus a
// service-injected parentUserId, never a user-editable field) returned
// HTTP 200 / status "SUCCESS" / statusCode "ADD_SUB_200", and
// isGeneratedMobile:true was accepted with no mobileNumber sent at all.
export interface AddSubordinatePayload {
  name: string;
  role: "supervisor";
  site_id: number;
  isGeneratedMobile: true;
  parentUserId: string;
}

export interface AddSubordinateResponse {
  status: "SUCCESS" | "FAILURE" | string;
  statusCode?: string;
  statusMsg?: string;
  message?: string;
}

// LIVE-VERIFIED (§28): a real POST /v2/editSubordinate request using
// exactly this 9-key shape — the legacy edit-elist.component.ts
// structure, `id` (not `userId`) and `site_id` (not `siteId`) — returned
// HTTP 200 / status "SUCCESS" / statusCode "EDIT_SUB_200" and renamed the
// existing record in place rather than creating a duplicate.
export interface EditSubordinatePayload {
  id: number;
  name: string;
  mobileNumber: string;
  aadharNumber: string | null;
  site_id: number;
  role: string;
  rate: number | string | null;
  parentName: string | null;
  panNumber: string | null;
}

export interface EditSubordinateResponse {
  status: "SUCCESS" | "FAILURE" | string;
  statusCode?: string;
  message?: string;
}

// LIVE-VERIFIED (§27 cleanup step, §9): the cleanup mechanism used by the
// verification pass itself — HTTP 200 / status "SUCCESS" on a real delete.
export interface DeleteSubordinateResponse {
  status: "SUCCESS" | "FAILURE" | string;
  statusMsg?: string;
}
