export type KnownAttendanceStatus = "Present" | "Absent" | "Overtime" | "Half Day";

// Raw shape as returned by POST /v2/reports/attendance/json: an array of
// site-grouped blocks, each holding the group's own worker rows. Exact raw
// row field names are not confirmed against a live response (the migration
// blueprint only documents the flattened shape below) — field lookups here
// accept the documented name plus a same-meaning fallback so a slightly
// different backend key doesn't silently produce blank columns.
export interface AttendanceGroupRow {
  workerId?: number;
  id?: number;
  workerName?: string;
  name?: string;
  workerRole?: string;
  role?: string;
  date?: string;
  status?: string;
}

export interface AttendanceGroup {
  site?: string;
  supervisor?: string;
  rows?: AttendanceGroupRow[];
}

// Flattened, denormalized shape the UI renders — one row per worker, with
// the group's site/supervisor copied onto every row. This mirrors the
// Angular enterprise Attendance page's client-side flatten exactly. Status
// is passed through as-is rather than coerced to the known set: Angular
// never validated it at runtime either (the union type there is a compile
// time-only annotation), so an unexpected backend value is shown verbatim
// instead of being silently misclassified.
export interface AttendanceRecord {
  workerId: number;
  workerName: string;
  workerRole: string;
  site: string;
  date: string;
  siteManager: string;
  status: string;
}

export function flattenAttendanceGroups(groups: AttendanceGroup[]): AttendanceRecord[] {
  return groups.flatMap((group) =>
    (group.rows ?? []).map((row) => ({
      workerId: row.workerId ?? row.id ?? 0,
      workerName: row.workerName ?? row.name ?? "—",
      workerRole: row.workerRole ?? row.role ?? "—",
      site: group.site ?? "—",
      date: row.date ?? "—",
      siteManager: group.supervisor ?? "—",
      status: row.status ?? "—",
    })),
  );
}
