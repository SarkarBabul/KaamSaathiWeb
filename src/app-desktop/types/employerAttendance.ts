// Field names and behavior verified directly against the Angular Employer
// source (features/dashboard/employer/attendance/**) — a materially
// different feature from Enterprise Attendance/Payments (which use
// /v2/reports/attendance/json and /v2/enterprise/payments/ledger, a
// read-only reporting ledger). This is a live day-to-day attendance
// marking + per-worker payment feature with its own endpoint family.
export type AttendanceStatus = "ABSENT" | "HALF_DAY" | "PRESENT" | "ONE_AND_HALF_DAY" | "DOUBLE_DAY";

export interface AttendanceOption {
  value: AttendanceStatus;
  label: string;
  short: string;
  multiplier: number;
  requiresInput?: boolean;
}

// Verbatim from attendance.types.ts's ATTENDANCE_OPTIONS.
export const ATTENDANCE_OPTIONS: AttendanceOption[] = [
  { value: "ABSENT", label: "Absent", short: "A", multiplier: 0 },
  { value: "HALF_DAY", label: "Half Day", short: "½", multiplier: 0.5, requiresInput: true },
  { value: "PRESENT", label: "Present", short: "P", multiplier: 1 },
  { value: "ONE_AND_HALF_DAY", label: "+½ Day", short: "1½", multiplier: 1.5, requiresInput: true },
  { value: "DOUBLE_DAY", label: "2x Day", short: "2", multiplier: 2 },
];

export interface EmployerWorker {
  userId: number;
  name: string;
  role: string;
  dailyRate: number;
  attendance: AttendanceStatus;
  avatar: string;
  overtimeHours?: number;
  customHourlyRate?: number;
  phone?: string;
  isActive?: boolean;
  siteId?: number | null;
  siteName?: string | null;
}

export interface EmployerAttendanceSite {
  id: number;
  name: string;
  location?: string;
}

export interface AttendanceRequest {
  userId: number;
  status: AttendanceStatus;
  attendanceBy: number;
  date: string;
  overtimeHours?: number;
}

// getAttendance/{userId} response row.
export interface AttendanceHistoryRecord {
  date: string;
  status: string;
  earnings: number;
}

// payment/history response row.
export interface PaymentHistoryRecord {
  date: string;
  amount: number;
  mode: string;
  comment: string;
}

export interface EmployeeBalance {
  balance: number;
  totalEarnings: number;
  totalPaid: number;
  paymentsMade: number;
  advancePayment: number;
  remaining: number;
  name: string;
  position: string;
  dailyRate: number;
}

export interface PaymentInput {
  userId: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  remarks: string;
  adminId: string;
}
