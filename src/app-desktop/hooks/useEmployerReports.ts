import { useQuery } from "@tanstack/react-query";
import { fetchEmployerAttendanceReport, fetchEmployerPaymentReport } from "@/app-desktop/api/employerReports.api";
import type { ReportDateRange } from "@/app-desktop/types/employerReports";

export function useEmployerAttendanceReport(leaderId: number | undefined, query: ReportDateRange) {
  return useQuery({
    queryKey: ["employerAttendanceReport", leaderId, query.startDate, query.endDate, query.siteId],
    queryFn: () => fetchEmployerAttendanceReport(leaderId!, query),
    enabled: Boolean(leaderId) && Boolean(query.startDate) && Boolean(query.endDate),
  });
}

export function useEmployerPaymentReport(leaderId: number | undefined, query: ReportDateRange) {
  return useQuery({
    queryKey: ["employerPaymentReport", leaderId, query.startDate, query.endDate, query.siteId],
    queryFn: () => fetchEmployerPaymentReport(leaderId!, query),
    enabled: Boolean(leaderId) && Boolean(query.startDate) && Boolean(query.endDate),
  });
}
