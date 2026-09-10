// Core 4 fields verified directly against the Angular `Site` interface
// (enterprise-user/pages/site-management/site-management.ts) and used by
// every existing consumer (Attendance/Payments/UserManagement dropdowns).
// The fields below that are NOT in that Angular interface were observed on
// the live GET /v2/getAllSites response body (Phase 3C live capture) —
// the real backend record is wider than either app's own Site type. They
// are all optional: some existing sites have them populated (created
// through some other path than this app's 3-field create form) and some
// don't, and no existing consumer of useSites reads them, so adding them
// here does not require touching any existing call site.
export interface Site {
  siteId: number;
  siteName: string;
  address: string;
  pinCode: string;
  location?: string | null;
  areaType?: string | null;
  ownerName?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  remarks?: string | null;
  activeFlag?: unknown;
  users?: unknown;
  userIds?: number[];
  employeeIds?: number[];
}

// Angular's SiteManagementService.addSite() body: the 3 form fields
// (siteName/address required, pinCode always sent — '' if left blank,
// never omitted, per site-management.ts's `pinCode?.toString() || ''`)
// plus a service-injected `userId` (never a user-editable field).
export interface AddSitePayload {
  siteName: string;
  address: string;
  pinCode: string;
  userId: string;
}

// Angular's SiteManagementService.editSite() body: same 3 form fields,
// plus the target record's `siteId` and `userId` — note `userId` is cast
// to a Number on the edit path in Angular (vs. a String on create), a
// real, source-confirmed inconsistency preserved here rather than
// "corrected" without backend confirmation.
export interface UpdateSitePayload {
  siteId: number;
  siteName: string;
  address: string;
  pinCode: string;
  userId: number;
}
