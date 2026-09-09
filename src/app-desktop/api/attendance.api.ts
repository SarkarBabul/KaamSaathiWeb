import { api, postBlob } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { AttendanceGroup } from "@/app-desktop/types/attendance";

// UNKNOWN — the migration blueprint doesn't state which base URL
// enterprise-attendance.service.ts targets (unlike User/Site Management,
// where the flag inconsistency is explicitly documented per call). This
// endpoint's own path segment ("/v2/enterprise/...") and its co-location
// with the other enterprise-dashboard services is the basis for choosing
// "enterprise" here — needs confirmation against the real backend.
const TARGET = "enterprise" as const;

export interface AttendanceQuery {
  userId: string;
  startDate?: string;
  endDate?: string;
}

export function fetchAttendance(query: AttendanceQuery) {
  return api.post<ApiEnvelope<AttendanceGroup[]>>(TARGET, "/v2/reports/attendance/json", query);
}

export function exportAttendancePdf(query: AttendanceQuery) {
  return postBlob(TARGET, "/v2/reports/attendance/pdf", query);
}

export function exportAttendanceExcel(query: AttendanceQuery) {
  return postBlob(TARGET, "/v2/reports/attendance/excel", query);
}
