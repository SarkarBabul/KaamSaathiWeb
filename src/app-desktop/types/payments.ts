export type PaymentStatus = "Paid" | "Partial" | "Pending";

// Raw shape as returned by POST /v2/enterprise/payments/ledger: site-grouped
// blocks; each row may carry its own siteName/siteManagerName which take
// priority over the group's site/supervisor (see flattenPaymentGroups).
// Field names verified directly against the Angular source
// (enterprise-user/pages/payments/payments.ts) — the worker's name comes
// back as `workerName`, not `worker`.
export interface PaymentGroupRow {
  payoutId?: number;
  workerId?: number;
  workerName?: string;
  role?: string;
  siteName?: string;
  siteManagerName?: string;
  attendance?: number | string;
  dailyWage?: number | string;
  earnings?: number | string;
  advance?: number | string;
  current?: number | string;
  due?: number | string;
  lastPaid?: string;
  status?: string;
}

export interface PaymentGroup {
  site?: string;
  supervisor?: string;
  rows?: PaymentGroupRow[];
}

export interface PaymentRow {
  payoutId: number;
  worker: string;
  role: string;
  site: string;
  siteManager: string;
  attendance: number;
  dailyWage: number;
  earnings: number;
  advance: number;
  current: number;
  due: number;
  lastPaid: string;
  status: PaymentStatus;
}

// Exact mapping from the Angular source's mapPaymentStatus() — preserve
// verbatim, this is documented business logic, not a guess.
export function mapPaymentStatus(status: string | undefined): PaymentStatus {
  const normalized = status?.toUpperCase();
  if (normalized === "PAID") return "Paid";
  if (normalized === "PARTIAL" || normalized === "PARTIALLY_PAID") return "Partial";
  return "Pending";
}

export function flattenPaymentGroups(groups: PaymentGroup[]): PaymentRow[] {
  return groups.flatMap((group) =>
    (group.rows ?? []).map((row) => ({
      // Angular falls back to workerId when payoutId is missing.
      payoutId: row.payoutId ?? row.workerId ?? 0,
      worker: row.workerName ?? "—",
      role: row.role ?? "—",
      // Fallback chains from the Angular source: a row's own name wins,
      // then the group's, then a literal em-dash placeholder.
      site: row.siteName ?? group.site ?? "—",
      siteManager: row.siteManagerName ?? group.supervisor ?? "—",
      // Angular wraps every numeric field in Number(...) defensively, in
      // case the backend sends a numeric string — matched here.
      attendance: Number(row.attendance ?? 0),
      dailyWage: Number(row.dailyWage ?? 0),
      earnings: Number(row.earnings ?? 0),
      advance: Number(row.advance ?? 0),
      current: Number(row.current ?? 0),
      due: Number(row.due ?? 0),
      lastPaid: row.lastPaid ?? "—",
      status: mapPaymentStatus(row.status),
    })),
  );
}
