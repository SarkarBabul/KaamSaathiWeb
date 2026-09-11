import { api, postBlob } from "@/app-desktop/api/httpClient";
import type { AttendanceReportRow, PaymentReportRow, ReportDateRange } from "@/app-desktop/types/employerReports";

// report.service.ts calls api.post/api.postBlob with no isEnterprise
// argument on every branch — all six calls below resolve to `default`.
const TARGET = "default" as const;

interface AttendanceReportResponse {
  subordinates?: Record<string, unknown>[];
}

// Endpoint spelling ("Attandance") is a real, confirmed backend typo
// preserved verbatim from report.service.ts — not a typo in this port.
export async function fetchEmployerAttendanceReport(leaderId: number, query: ReportDateRange): Promise<AttendanceReportRow[]> {
  const res = await api.post<AttendanceReportResponse>(TARGET, "/v1/authenticate/subordinates/AttandanceReport", {
    leaderId,
    startDate: query.startDate,
    endDate: query.endDate,
    reportFlag: "",
    siteId: query.siteId ?? undefined,
  });
  const rows = Array.isArray(res.subordinates) ? res.subordinates : [];
  return rows.map((r) => ({
    name: (r.name as string) ?? "",
    role: (r.roleName as string) ?? "",
    phone: (r.mobileNumber as string) ?? "",
    present: Number(r.presentCount ?? 0),
    absent: Number(r.absentCount ?? 0),
    presentPercentage: Number(r.presentPercentage ?? 0),
    absentPercentage: Number(r.absentPercentage ?? 0),
  }));
}

// The PDF/Excel blob endpoints are on /v2, correctly spelled "Attendance" —
// a real, confirmed inconsistency with the /v1 JSON endpoint above, not a
// mistake introduced here.
export function downloadEmployerAttendanceReportPdf(leaderId: number, query: ReportDateRange) {
  return postBlob(TARGET, "/v2/subordinates/AttendanceReport/pdf", { leaderId, ...query, reportFlag: "PDF" });
}

export function downloadEmployerAttendanceReportExcel(leaderId: number, query: ReportDateRange) {
  return postBlob(TARGET, "/v2/subordinates/AttendanceReport/excel", { leaderId, ...query, reportFlag: "EXCEL" });
}

interface PaymentReportResponse {
  subordinates?: Record<string, unknown>[];
}

export async function fetchEmployerPaymentReport(leaderId: number, query: ReportDateRange): Promise<PaymentReportRow[]> {
  const res = await api.post<PaymentReportResponse>(TARGET, "/v1/authenticate/subordinates/PaymentReport", {
    leaderId,
    startDate: query.startDate,
    endDate: query.endDate,
    reportFlag: "",
    siteId: query.siteId ?? undefined,
  });
  const rows = Array.isArray(res.subordinates) ? res.subordinates : [];
  return rows.map((r) => ({
    workerId: Number(r.workerId ?? 0),
    name: (r.name as string) ?? "",
    siteName: (r.siteName as string) ?? "",
    roleName: (r.roleName as string) ?? "",
    rate: Number(r.rate ?? 0),
    totalEarned: Number(r.totalEarned ?? 0),
    totalPaid: Number(r.totalPaid ?? 0),
    currentBalance: Number(r.currentBalance ?? 0),
    lastPaymentDate: (r.lastPaymentDate as string) ?? "",
    daysWorked: Number(r.daysWorked ?? 0),
  }));
}

// The literal `?siteId=' '` / `?siteId=''` querystrings are a real,
// confirmed bug preserved from report.service.ts (a quoted-space and an
// empty-string placeholder, neither ever containing the actual selected
// site) — not corrected here without backend confirmation, per the
// migration brief's explicit instruction on this exact endpoint.
export function downloadEmployerPaymentReportPdf(leaderId: number, query: Omit<ReportDateRange, "siteId">) {
  return postBlob(TARGET, "/v1/authenticate/subordinates/PaymentReport/pdf?siteId=' '", { leaderId, ...query, reportFlag: "PDF" });
}

export function downloadEmployerPaymentReportExcel(leaderId: number, query: Omit<ReportDateRange, "siteId">) {
  return postBlob(TARGET, "/v1/authenticate/subordinates/PaymentReport/excel?siteId=''", { leaderId, ...query, reportFlag: "EXCEL" });
}
