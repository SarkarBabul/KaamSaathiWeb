import { api } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { SiteSummary, WorkerAttendanceSummary } from "@/app-desktop/types/dashboard";

// Same two GET endpoints the Angular source's DashboardService calls
// (enterprise-dashboard.service.ts) that the live backend actually honors.
// Verified against payments/attendance migration: the "/v2/enterprise/..."
// path segment targets the `default` API base, not `enterprise`, despite
// the name.
//
// A third endpoint, monthly-finance-summary, was deliberately dropped here:
// a live network capture (Chrome DevTools MCP against the real backend)
// showed it returning 401 "Full authentication is required to access this
// resource" using the exact same Authorization/authKey headers that
// site-summary and worker-attendance-summary succeed with in the same
// request burst — a backend-side auth-filter gap on that one route, not a
// client credential/header/target problem. Because httpClient.ts treats any
// 401 as a session-wide logout, calling it was silently logging every
// enterprise user out immediately after dashboard mount.
const TARGET = "default" as const;

export function fetchSiteSummary(enterpriseId: string) {
  return api.get<ApiEnvelope<SiteSummary>>(TARGET, "/v2/enterprise/dashboard/site-summary", { enterpriseId });
}

export function fetchWorkerAttendanceSummary(enterpriseId: string) {
  return api.get<ApiEnvelope<WorkerAttendanceSummary>>(
    TARGET,
    "/v2/enterprise/dashboard/worker-attendance-summary",
    { enterpriseId },
  );
}
