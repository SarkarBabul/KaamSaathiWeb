import { api, postBlob } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { AttendanceGroup } from "@/app-desktop/types/attendance";

// Verified directly against the Angular source (enterprise-attendance.service.ts
// + api.service.ts): getAttendance() calls api.post(url, payload) with no flag
// argument, so ApiService's flag defaults to false -> apiBaseUrl. Both
// downloadAttendancePdf/Excel call api.postBlob(), which has no flag
// parameter at all and always hits apiBaseUrl unconditionally. All three
// calls are "default", never "enterprise" — confirmed, not inferred.
const TARGET = "default" as const;

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
