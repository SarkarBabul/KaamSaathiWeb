import { useQuery } from "@tanstack/react-query";
import { fetchSiteSummary, fetchWorkerAttendanceSummary } from "@/app-desktop/api/dashboard.api";
import type { SiteSummary, WorkerAttendanceSummary } from "@/app-desktop/types/dashboard";

// Two independent queries mirroring the Angular dashboard component's
// ngOnInit calls (getSiteSummary / getWorkerAttendanceSummary) — each tile
// only shows real data once its own query resolves, so a slow/broken
// endpoint doesn't block the other tile. getMonthlyFinanceSummary is
// deliberately not called here — see the comment in dashboard.api.ts: the
// live backend 401s on that route and the global httpClient 401 handler
// logs the whole session out as a result.
export function useDashboardSummary(enterpriseId: string | undefined) {
  const siteSummary = useQuery<SiteSummary | null>({
    queryKey: ["dashboard", "site-summary", enterpriseId],
    queryFn: async () => {
      const res = await fetchSiteSummary(enterpriseId!);
      return res.status === "SUCCESS" && res.data ? res.data : null;
    },
    enabled: Boolean(enterpriseId),
  });

  const attendanceSummary = useQuery<WorkerAttendanceSummary | null>({
    queryKey: ["dashboard", "worker-attendance-summary", enterpriseId],
    queryFn: async () => {
      const res = await fetchWorkerAttendanceSummary(enterpriseId!);
      return res.status === "SUCCESS" && res.data ? res.data : null;
    },
    enabled: Boolean(enterpriseId),
  });

  return { siteSummary, attendanceSummary };
}
