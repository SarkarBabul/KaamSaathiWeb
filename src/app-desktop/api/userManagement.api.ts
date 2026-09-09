import { api } from "@/app-desktop/api/httpClient";
import type { SubordinatesResponse } from "@/app-desktop/types/userManagement";

// VERIFIED FROM LIVE NETWORK (USER_MANAGEMENT_API_VERIFICATION.md §18.4):
// the live enterprise User Management page's list request is
// POST /v2/getSubordinate against api.kametgroup.com (Angular's `default`
// apiBaseUrl), body { parentId }. This is the only user-list contract that
// has been exercised end-to-end by the real app.
//
// addSubordinate / editSubordinate are deliberately NOT implemented here —
// the create/edit target (default vs enterprise) and payload keys
// (siteId/userId vs site_id/id) remain an unresolved contract conflict
// (§16, §19 of the verification doc). PENDING PHASE 3B API DECISION.
const TARGET = "default" as const;

export function getSubordinates(parentId: string) {
  return api.post<SubordinatesResponse>(TARGET, "/v2/getSubordinate", { parentId });
}
