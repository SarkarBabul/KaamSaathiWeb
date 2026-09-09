export type KnownAttendanceStatus = "Present" | "Absent" | "Overtime" | "Half Day";

// Raw shape as returned by POST /v2/reports/attendance/json: an array of
// site-grouped blocks, each holding the group's own worker rows. Field
// names verified directly against the Angular source
// (enterprise-user/pages/attendance/attendance.ts) — no alternate key
// names exist on the real payload, so lookups here use the exact field
// only, matching the confirmed contract rather than guessing at variants.
export interface AttendanceGroupRow {
  workerId?: number;
  workerName?: string;
  workerRole?: string;
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
// Angular enterprise Attendance page's client-side flatten exactly,
// including its fallback values (verified against the real component: a
// missing/null status defaults to 'Absent', not a placeholder dash).
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
      workerId: row.workerId ?? 0,
      workerName: row.workerName ?? "—",
      workerRole: row.workerRole ?? "—",
      site: group.site ?? "—",
      date: row.date ?? "—",
      siteManager: group.supervisor ?? "—",
      status: row.status ?? "Absent",
    })),
  );
}
