export type PaymentStatus = "Paid" | "Partial" | "Pending";

// Raw shape as returned by POST /v2/enterprise/payments/ledger: site-grouped
// blocks; each row may carry its own siteName/siteManagerName which take
// priority over the group's site/supervisor (see flattenPaymentGroups).
export interface PaymentGroupRow {
  payoutId?: number;
  worker?: string;
  role?: string;
  siteName?: string;
  siteManagerName?: string;
  attendance?: number;
  dailyWage?: number;
  earnings?: number;
  advance?: number;
  current?: number;
  due?: number;
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
      payoutId: row.payoutId ?? 0,
      worker: row.worker ?? "—",
      role: row.role ?? "—",
      // Fallback chains from the Angular source: a row's own name wins,
      // then the group's, then a literal em-dash placeholder.
      site: row.siteName ?? group.site ?? "—",
      siteManager: row.siteManagerName ?? group.supervisor ?? "—",
      attendance: row.attendance ?? 0,
      dailyWage: row.dailyWage ?? 0,
      earnings: row.earnings ?? 0,
      advance: row.advance ?? 0,
      current: row.current ?? 0,
      due: row.due ?? 0,
      lastPaid: row.lastPaid ?? "—",
      status: mapPaymentStatus(row.status),
    })),
  );
}
