// MOCK / DEMO DATA — NOT BACKED BY ANY API.
//
// The Angular source's dashboard.component.ts hardcodes these exact same
// chart series as signal defaults that are never overwritten by a network
// call (confirmed during the Phase-3 API audit: only site-summary,
// worker-attendance-summary, and monthly-finance-summary are real
// endpoints; there is no chart/quick-actions/AI-insights API in Angular
// either). This file exists so that mock values used purely to render the
// chart visuals stay isolated from real, API-backed dashboard state —
// nothing here should ever be merged into a query result. When a real
// dashboard-charts API is introduced, replace the imports of this file with
// a hook, without touching the chart components themselves.

export interface AttendanceTrendPoint {
  day: string;
  present: number;
  absent: number;
}

export const MOCK_ATTENDANCE_TREND: AttendanceTrendPoint[] = [
  { day: "Mon", present: 396, absent: 54 },
  { day: "Tue", present: 408, absent: 42 },
  { day: "Wed", present: 385, absent: 65 },
  { day: "Thu", present: 415, absent: 52 },
  { day: "Fri", present: 422, absent: 35 },
  { day: "Sat", present: 402, absent: 48 },
  { day: "Sun", present: 268, absent: 82 },
];

export interface WorkerRoleSlice {
  role: string;
  count: number;
  color: string;
}

export const MOCK_WORKER_ROLES: WorkerRoleSlice[] = [
  { role: "Helper", count: 180, color: "#ff6b35" },
  { role: "Mistry", count: 120, color: "#1689d6" },
  { role: "Electrician", count: 50, color: "#00b56a" },
  { role: "Painter", count: 40, color: "#e2a300" },
  { role: "Plumber", count: 35, color: "#c44ac0" },
  { role: "Supervisor", count: 25, color: "#0c8aa5" },
];

export interface FinancePoint {
  month: string;
  income: number;
  expense: number;
}

export const MOCK_FINANCE_TREND: FinancePoint[] = [
  { month: "Feb", income: 18, expense: 12 },
  { month: "Mar", income: 21, expense: 14 },
  { month: "Apr", income: 17, expense: 13.5 },
  { month: "May", income: 24, expense: 20 },
  { month: "Jun", income: 25, expense: 19 },
  { month: "Jul", income: 28, expense: 21 },
];

export interface SiteLabourPoint {
  site: string;
  workers: number;
}

export const MOCK_SITE_LABOUR: SiteLabourPoint[] = [
  { site: "Skyline Tower", workers: 92 },
  { site: "Green Valley", workers: 78 },
  { site: "Metro Bridge", workers: 65 },
  { site: "Riverside Villas", workers: 60 },
  { site: "IT Park Phase 2", workers: 55 },
  { site: "Airport Extn.", workers: 40 },
];

export interface AiInsight {
  severity: "danger" | "warning" | "success";
  title: string;
  detail: string;
}

export const MOCK_AI_INSIGHTS: AiInsight[] = [
  {
    severity: "danger",
    title: "Low attendance at Metro Bridge",
    detail: "Only 68% present today — 12% below site avg.",
  },
  {
    severity: "warning",
    title: "Cement expense spiked 22%",
    detail: "Skyline Tower vs last month — verify vendor.",
  },
  {
    severity: "success",
    title: "Riverside Villas ahead of plan",
    detail: "6 days ahead of schedule · reallocate crew?",
  },
];
