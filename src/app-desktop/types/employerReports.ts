// Verified against Angular's attendance-report.component.ts / .html and
// report.service.ts. Field names come straight from the live
// /v1/authenticate/subordinates/AttandanceReport response mapping.
export interface AttendanceReportRow {
  name: string;
  role: string;
  phone: string;
  present: number;
  absent: number;
  presentPercentage: number;
  absentPercentage: number;
}

// Verified against payment-report.component.ts's response mapping.
export interface PaymentReportRow {
  workerId: number;
  name: string;
  siteName: string;
  roleName: string;
  rate: number;
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  lastPaymentDate: string;
  daysWorked: number;
}

export interface ReportDateRange {
  startDate: string;
  endDate: string;
  siteId?: string | null;
}
