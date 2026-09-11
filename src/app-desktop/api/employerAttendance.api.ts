import { api, ApiError } from "@/app-desktop/api/httpClient";
import type {
  AttendanceRequest,
  EmployerWorker,
} from "@/app-desktop/types/employerAttendance";

// Every endpoint below is called with no `isEnterprise` argument in the
// Angular source (attendance.service.ts) — ApiService's own default applies,
// resolving every one of these to the `default` target.
const TARGET = "default" as const;

function extractRole(roleName: string | undefined | null): string {
  if (!roleName) return "";
  const parts = roleName.split(" - ");
  return parts.length > 1 ? parts[1].trim() : parts[0].trim();
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// Mirrors attendance.service.ts's inline mapping in getEmployees()/
// getLaborsBySite() verbatim, including the multi-key fallback chains.
function mapWorker(emp: Record<string, unknown>, fallbackSiteId?: number): EmployerWorker {
  const roleName = (emp.roleName as string) ?? "";
  const name = (emp.userName as string) ?? (emp.name as string) ?? "N/A";
  return {
    userId: Number(emp.id ?? emp.userId),
    name,
    role: extractRole(roleName) || (emp.userRole as string) || (emp.role as string) || (emp.designation as string) || "Worker",
    dailyRate: Number(emp.rate ?? emp.dailyWage ?? 0),
    attendance: "ABSENT",
    avatar: getInitials(name),
    phone: (emp.phone as string) ?? (emp.mobileNumber as string) ?? "",
    isActive: true,
    siteId: (emp.siteId as number) ?? fallbackSiteId ?? null,
    siteName: (emp.siteName as string) ?? null,
  };
}

interface GetSubordinateResponse {
  status?: string;
  subordinates?: Record<string, unknown>[];
}

export async function getEmployerAttendanceWorkers(parentId: string): Promise<EmployerWorker[]> {
  const res = await api.post<GetSubordinateResponse>(TARGET, "/v2/getSubordinate", { parentId });
  const employees = Array.isArray(res.subordinates) ? res.subordinates : [];
  return employees.map((emp) => mapWorker(emp));
}

interface GetLaborsBySiteResponse {
  data?: Record<string, unknown>[];
}

// Backend returns HTTP 404 with statusCode GET_LABORS_404 when a site has no
// laborers — Angular treats that as an empty list, not an error (source
// comment in attendance.service.ts). Reproduced here rather than surfacing
// a false error state for a legitimately empty site.
export async function getEmployerLaborsBySite(siteId: number, leaderId: number): Promise<EmployerWorker[]> {
  try {
    const res = await api.post<GetLaborsBySiteResponse>(TARGET, "/v2/getLaborsBySite", {
      site_id: siteId,
      leader_id: leaderId,
      leaderId,
      userId: leaderId,
    });
    const employees = Array.isArray(res.data) ? res.data : [];
    return employees.map((emp) => mapWorker(emp, siteId));
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || (err.body as { statusCode?: string })?.statusCode === "GET_LABORS_404")) {
      return [];
    }
    throw err;
  }
}

interface AttendanceByDateRecord {
  userId: number | string;
  date: string;
  status?: string;
  overtimeHours?: number;
  overtime?: number;
}

interface GetAttendanceByDateResponse {
  subordinates?: AttendanceByDateRecord[];
}

// GET /v2/leader/{leaderId}?date=YYYY-MM-DD — the backend returns every
// record for the leader, not just the requested date, so Angular filters
// client-side (attendance.service.ts's getAttendanceByDate()); reproduced
// identically rather than trusting the endpoint to pre-filter.
export async function getEmployerAttendanceByDate(leaderId: string, date: string): Promise<AttendanceByDateRecord[]> {
  const res = await api.get<GetAttendanceByDateResponse>(TARGET, `/v2/leader/${leaderId}`, { date });
  const allRecords = Array.isArray(res.subordinates) ? res.subordinates : [];
  return allRecords.filter((r) => r.date === date);
}

export function markEmployerAttendance(records: AttendanceRequest[]) {
  return api.post<{ needsUpdate?: boolean }>(TARGET, "/v2/markAttendance", records);
}

export function updateEmployerAttendance(records: AttendanceRequest[]) {
  return api.post<unknown>(TARGET, "/v2/updateAttendance", records);
}

interface BalanceResponse {
  data?: Record<string, unknown>;
  balance?: number;
}

const EMPTY_BALANCE = {
  balance: 0,
  totalEarnings: 0,
  totalPaid: 0,
  paymentsMade: 0,
  advancePayment: 0,
  remaining: 0,
  name: "Unknown Worker",
  position: "Worker",
  dailyRate: 0,
};

// A worker who hasn't accrued a computed balance yet legitimately 404s here
// (observed live: "No balance found for userId ..."). Angular's own
// record-payment.component.ts treats this the same way — its forkJoin
// catchError swallows the error and leaves the worker's balance fields at
// their zero defaults, with no retry. Caught here rather than left to
// react-query's default 3x retry, which would otherwise turn one expected
// 404 into four requests.
export async function getEmployerEmployeeBalance(userId: string, leaderId: string) {
  let res: BalanceResponse;
  try {
    res = await api.get<BalanceResponse>(TARGET, "/v2/balance", { userId, leaderId });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return EMPTY_BALANCE;
    }
    throw err;
  }
  const b = res.data ?? (res.balance !== undefined ? (res as unknown as Record<string, unknown>) : {});
  const totalEarned = Number(b.totalEarned ?? b.totalEarnings ?? 0);
  const totalPaid = Number(b.totalPaid ?? 0);
  return {
    balance: Number(b.currentBalance ?? b.balance ?? b.remaining ?? 0),
    totalEarnings: totalEarned,
    totalPaid,
    paymentsMade: Math.max(0, totalPaid - Number(b.advancePayment ?? 0)),
    advancePayment: Number(b.advancePayment ?? b.advance ?? 0),
    remaining: totalEarned - totalPaid,
    name: (b.employeeName as string) ?? (b.name as string) ?? (b.userName as string) ?? "Unknown Worker",
    position: (b.position as string) ?? (b.role as string) ?? "Worker",
    dailyRate: Number(b.rate ?? b.dailyRate ?? 0),
  };
}

interface AttendanceHistoryResponse {
  attendance?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
}

export async function getEmployerAttendanceHistory(userId: string) {
  const res = await api.get<AttendanceHistoryResponse>(TARGET, `/v2/getAttendance/${userId}`);
  return Array.isArray(res.attendance) ? res.attendance : Array.isArray(res.data) ? res.data : [];
}

interface PaymentHistoryResponse {
  payments?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
}

export async function getEmployerPaymentHistory(userId: string, startDate: string, endDate: string) {
  const res = await api.post<PaymentHistoryResponse>(TARGET, "/v2/payment/history", { userId, startDate, endDate });
  return Array.isArray(res.payments) ? res.payments : Array.isArray(res.data) ? res.data : [];
}

interface ProcessPaymentResponse {
  success?: boolean;
  message?: string;
}

// Angular wraps the single payment object in an array — [paymentData] —
// preserved exactly (processPayment() in attendance.service.ts).
export function processEmployerPayment(payment: {
  userId: number;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  remarks: string;
  adminId: string;
}) {
  return api.post<ProcessPaymentResponse>(TARGET, "/v2/payment/process", [payment]);
}
