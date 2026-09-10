import { api } from "@/app-desktop/api/httpClient";
import type { AddSitePayload, UpdateSitePayload } from "@/app-desktop/types/site";

// List/fetch is deliberately NOT duplicated here — getSites() in
// masterData.api.ts (used via useSites()) is already the live-verified,
// working list call (Phase 3C live capture: GET /v2/getAllSites, target
// default, 200). This module only adds the two mutations Site Management
// itself needs.

// Source-derived target: default; live mutation verification
// intentionally deferred because Site Management has no safe
// delete/rollback endpoint. (Angular's SiteManagementService.addSite() is
// called with no `isEnterprise` argument, and ApiService.post()'s flag
// genuinely switches host on POST — unlike GET, where the same flag is a
// no-op. Phase 3C source audit, not yet exercised against the real
// backend.)
const CREATE_TARGET = "default" as const;

// Source-derived target: enterprise; live mutation verification
// intentionally deferred because Site Management has no safe
// delete/rollback endpoint. (Angular calls `editSite(updatePayload,
// true)`, and ApiService.put()'s flag genuinely switches host on PUT.
// Phase 3C source audit, not yet exercised against the real backend — do
// not assume this matches addSite's target just because they're on the
// same page; User Management's equivalent split did NOT hold up under
// live testing.)
const EDIT_TARGET = "enterprise" as const;

// Response shape is intentionally untyped (`unknown`): Angular's own
// create/edit success handlers don't agree on how to read the response
// (create treats it as a raw Site object; edit never reads the response
// body at all — it optimistically merges the request's own form values
// instead, see the Phase 3C source audit), so no specific envelope shape
// is assumed here either. A non-2xx response already throws ApiError via
// httpClient — "this resolved" is the only signal this layer relies on.
export function addSite(payload: AddSitePayload): Promise<unknown> {
  return api.post<unknown>(CREATE_TARGET, "/v2/addSite", payload);
}

export function updateSite(payload: UpdateSitePayload): Promise<unknown> {
  return api.put<unknown>(EDIT_TARGET, "/v2/updateSite", payload);
}
