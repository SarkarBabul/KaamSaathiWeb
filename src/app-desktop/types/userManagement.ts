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
}

// The live `getSubordinate` response envelope, verified from Angular's
// `getEmployees()` handling (`res.status === 'SUCCESS' && res.subordinates`)
// and corroborated by the Flutter client (§8 of the verification doc).
export interface SubordinatesResponse {
  status: "SUCCESS" | "FAILURE" | string;
  subordinates?: EnterpriseUser[];
}
