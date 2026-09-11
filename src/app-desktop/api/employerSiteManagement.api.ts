import { api } from "@/app-desktop/api/httpClient";
import type { UpdateSitePayload } from "@/app-desktop/types/site";

// List (masterData.api.ts's getSites, via useSites) and Create
// (siteManagement.api.ts's addSite, via useAddSite) are genuinely identical
// between Employer and Enterprise — both real Angular call sites invoke
// them with no `isEnterprise` argument, so both already resolve to
// `default` — and are reused directly rather than duplicated here.
//
// Edit is the one operation that genuinely differs: Enterprise's Angular
// component calls `editSite(updatePayload, true)` (target `enterprise`,
// see siteManagement.api.ts's EDIT_TARGET), but the Employer Angular
// component (features/dashboard/employer/site-management/
// site-management.component.ts, submit()) calls
// `this.service.editSite(updatePayload)` with no second argument at all —
// SiteManagementService.editSite()'s own `isEnterprise: boolean = false`
// default applies, so the real Employer edit call resolves to `default`,
// not `enterprise`. Confirmed directly from both Angular source files
// during the Phase 4C audit — not assumed from the Enterprise contract.
const EDIT_TARGET = "default" as const;

export function updateEmployerSite(payload: UpdateSitePayload): Promise<unknown> {
  return api.put<unknown>(EDIT_TARGET, "/v2/updateSite", payload);
}
