import type { AttendanceStatus, EmployerWorker } from "@/app-desktop/types/employerAttendance";

// Mirrors attendance.component.ts's calculateEarning() exactly.
export function calculateEarning(worker: EmployerWorker): number {
  if (worker.attendance === "ABSENT") return 0;
  const rate = worker.customHourlyRate;
  const hours = worker.overtimeHours || 0;
  switch (worker.attendance) {
    case "HALF_DAY":
      if (hours > 0 && rate) return hours * rate;
      return worker.dailyRate * 0.5;
    case "PRESENT": {
      if (hours > 0) {
        const hourlyRate = rate || worker.dailyRate / 8;
        return worker.dailyRate + hours * hourlyRate;
      }
      return worker.dailyRate;
    }
    case "ONE_AND_HALF_DAY":
      if (hours > 0 && rate) return worker.dailyRate + hours * rate;
      return worker.dailyRate * 1.5;
    case "DOUBLE_DAY":
      return worker.dailyRate * 2;
    default:
      return 0;
  }
}

interface DatedAttendanceRecord {
  userId: number | string;
  status?: string;
  overtimeHours?: number;
  overtime?: number;
}

// Joins the worker roster with that day's attendance records the same way
// the Attendance page does (a worker with no record for the day is ABSENT).
export function applyAttendanceRecords(workers: EmployerWorker[], records: DatedAttendanceRecord[]): EmployerWorker[] {
  return workers.map((worker) => {
    const record = records.find((r) => Number(r.userId) === worker.userId);
    if (record) {
      return {
        ...worker,
        attendance: (record.status as AttendanceStatus) || "ABSENT",
        overtimeHours: Number(record.overtimeHours ?? record.overtime ?? 0),
      };
    }
    return { ...worker, attendance: "ABSENT" as AttendanceStatus, overtimeHours: 0 };
  });
}
