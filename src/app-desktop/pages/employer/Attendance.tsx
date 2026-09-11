import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarCheck, Clock3, IndianRupee, Loader2, UserCheck, UserX, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import {
  useEmployerAttendanceByDate,
  useEmployerAttendanceWorkers,
  useMarkEmployerAttendance,
  useUpdateEmployerAttendance,
} from "@/app-desktop/hooks/useEmployerAttendance";
import { ApiError } from "@/app-desktop/api/httpClient";
import { calculateEarning } from "@/app-desktop/utils/attendanceEarning";
import { ATTENDANCE_OPTIONS, type AttendanceStatus, type EmployerWorker } from "@/app-desktop/types/employerAttendance";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  ABSENT: "Absent",
  HALF_DAY: "Half Day",
  PRESENT: "Present",
  ONE_AND_HALF_DAY: "1.5 Days",
  DOUBLE_DAY: "2 Days",
};

const STATUS_BADGE_CLASS: Record<AttendanceStatus, string> = {
  ABSENT: "border-transparent bg-red-50 text-red-600",
  HALF_DAY: "border-transparent bg-amber-50 text-amber-600",
  PRESENT: "border-transparent bg-emerald-50 text-emerald-600",
  ONE_AND_HALF_DAY: "border-transparent bg-blue-50 text-blue-600",
  DOUBLE_DAY: "border-transparent bg-blue-50 text-blue-600",
};

interface OvertimeDialogState {
  workerId: number;
  type: Extract<AttendanceStatus, "HALF_DAY" | "ONE_AND_HALF_DAY">;
  hours: string;
  rate: string;
}

export default function Attendance() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const leaderId = session?.parentId ? Number(session.parentId) : 0;
  const today = todayIso();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "role" | "status">("name");
  const [overtimeDialog, setOvertimeDialog] = useState<OvertimeDialogState | null>(null);

  // userId -> optimistic override applied after a successful mark/update,
  // so the UI never flickers/reverts while the by-date query is still the
  // one from before the click (mirrors Angular's pendingUpdates map).
  const [overrides, setOverrides] = useState<
    Record<number, { attendance: AttendanceStatus; overtimeHours: number; customHourlyRate?: number }>
  >({});
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const sitesQuery = useSites(session?.userId);
  const workersQuery = useEmployerAttendanceWorkers(session?.parentId, selectedSiteId, leaderId);
  const attendanceQuery = useEmployerAttendanceByDate(session?.parentId, selectedDate);
  const markAttendance = useMarkEmployerAttendance();
  const updateAttendance = useUpdateEmployerAttendance();

  const sites = sitesQuery.data ?? [];
  const rawWorkers = useMemo(() => workersQuery.data ?? [], [workersQuery.data]);
  const attendanceRecords = useMemo(() => attendanceQuery.data ?? [], [attendanceQuery.data]);

  const existingRecordIds = useMemo(() => {
    const set = new Set<number>();
    attendanceRecords.forEach((r) => set.add(Number(r.userId)));
    return set;
  }, [attendanceRecords]);

  const workers: EmployerWorker[] = useMemo(() => {
    return rawWorkers.map((worker) => {
      const override = overrides[worker.userId];
      if (override) {
        return { ...worker, ...override };
      }
      const record = attendanceRecords.find((r) => Number(r.userId) === worker.userId);
      if (record) {
        return {
          ...worker,
          attendance: (record.status as AttendanceStatus) || "ABSENT",
          overtimeHours: Number(record.overtimeHours ?? record.overtime ?? 0),
        };
      }
      return { ...worker, attendance: "ABSENT" as AttendanceStatus, overtimeHours: 0 };
    });
  }, [rawWorkers, attendanceRecords, overrides]);

  const filteredWorkers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter((w) => {
      if (searchBy === "name") return w.name.toLowerCase().includes(q);
      if (searchBy === "role") return w.role.toLowerCase().includes(q);
      return STATUS_LABEL[w.attendance].toLowerCase().includes(q);
    });
  }, [workers, searchQuery, searchBy]);

  const presentCount = workers.filter((w) => w.attendance !== "ABSENT").length;
  const absentCount = workers.filter((w) => w.attendance === "ABSENT").length;
  const halfDayCount = workers.filter((w) => w.attendance === "HALF_DAY").length;
  const overtimeCount = workers.filter((w) => w.attendance === "ONE_AND_HALF_DAY" || w.attendance === "DOUBLE_DAY").length;
  const totalEarnings = workers.reduce((sum, w) => sum + calculateEarning(w), 0);

  const onDateChange = (value: string) => {
    if (value > today) {
      toast.error("Future dates are not allowed for attendance.");
      return;
    }
    setSelectedDate(value);
    setOverrides({});
  };

  const onSiteChange = (value: string) => {
    setSelectedSiteId(value);
    setOverrides({});
    setSearchQuery("");
  };

  const saveAttendance = (records: { userId: number; status: AttendanceStatus; overtimeHours: number }[]) => {
    const hasExisting = records.some((r) => existingRecordIds.has(r.userId));
    const payload = records.map((r) => ({
      userId: r.userId,
      status: r.status,
      attendanceBy: leaderId,
      date: selectedDate,
      overtimeHours: r.overtimeHours || 0,
    }));

    const onDone = () => {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        records.forEach((r) => next.delete(r.userId));
        return next;
      });
    };
    const onFail = () => {
      onDone();
      setOverrides((prev) => {
        const next = { ...prev };
        records.forEach((r) => delete next[r.userId]);
        return next;
      });
      toast.error(`Failed to ${hasExisting ? "update" : "mark"} attendance. Please try again.`);
    };

    if (hasExisting) {
      updateAttendance.mutate(payload, { onSuccess: onDone, onError: onFail });
    } else {
      markAttendance.mutate(payload, {
        onSuccess: (res) => {
          if (res.needsUpdate) {
            updateAttendance.mutate(payload, { onSuccess: onDone, onError: onFail });
            return;
          }
          onDone();
        },
        onError: onFail,
      });
    }
  };

  const markWorker = (worker: EmployerWorker, status: AttendanceStatus) => {
    if (processingIds.has(worker.userId)) return;
    setProcessingIds((prev) => new Set(prev).add(worker.userId));

    const keepsOvertime = status === "HALF_DAY" || status === "ONE_AND_HALF_DAY";
    const overtimeHours = keepsOvertime ? worker.overtimeHours ?? 0 : 0;
    setOverrides((prev) => ({
      ...prev,
      [worker.userId]: { attendance: status, overtimeHours, customHourlyRate: keepsOvertime ? worker.customHourlyRate : undefined },
    }));

    saveAttendance([{ userId: worker.userId, status, overtimeHours }]);
  };

  const onAttendanceClick = (worker: EmployerWorker, status: AttendanceStatus) => {
    const option = ATTENDANCE_OPTIONS.find((o) => o.value === status);
    if (option?.requiresInput) {
      setOvertimeDialog({
        workerId: worker.userId,
        type: status as "HALF_DAY" | "ONE_AND_HALF_DAY",
        hours: "",
        rate: String(Math.round(worker.dailyRate / 8)),
      });
      return;
    }
    markWorker(worker, status);
  };

  const submitOvertime = () => {
    if (!overtimeDialog) return;
    const worker = workers.find((w) => w.userId === overtimeDialog.workerId);
    if (!worker) return;
    const hours = parseFloat(overtimeDialog.hours) || 0;
    const rate = parseFloat(overtimeDialog.rate) || 0;

    if (processingIds.has(worker.userId)) return;
    setProcessingIds((prev) => new Set(prev).add(worker.userId));
    setOverrides((prev) => ({
      ...prev,
      [worker.userId]: { attendance: overtimeDialog.type, overtimeHours: hours, customHourlyRate: rate > 0 ? rate : undefined },
    }));
    saveAttendance([{ userId: worker.userId, status: overtimeDialog.type, overtimeHours: hours }]);
    setOvertimeDialog(null);
  };

  const overtimeTotal = overtimeDialog ? (parseFloat(overtimeDialog.hours) || 0) * (parseFloat(overtimeDialog.rate) || 0) : 0;

  const loading = workersQuery.isLoading || (workersQuery.isSuccess && attendanceQuery.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employer" title="Attendance" trailing={today === selectedDate ? "Today" : selectedDate} />

      {workersQuery.isError ? (
        <ErrorState
          message={workersQuery.error instanceof ApiError ? workersQuery.error.message : "Could not load attendance data."}
          onRetry={() => workersQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Present Today" value={presentCount} icon={UserCheck} tone="positive" index={0} />
            <StatCard label="Overtime" value={overtimeCount} icon={Clock3} tone="info" index={1} />
            <StatCard label="Half Day" value={halfDayCount} icon={CalendarCheck} tone="warning" index={2} />
            <StatCard label="Absent" value={absentCount} icon={UserX} tone="negative" index={3} />
            <StatCard
              label="Today's Wages"
              value={`₹${Math.round(totalEarnings).toLocaleString()}`}
              icon={IndianRupee}
              emphasis
              index={4}
            />
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="att-date">Date</Label>
                <Input
                  id="att-date"
                  type="date"
                  max={today}
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-site">Site</Label>
                <Select value={selectedSiteId} onValueChange={onSiteChange} name="siteId">
                  <SelectTrigger id="att-site">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites ({rawWorkers.length})</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.siteId} value={String(site.siteId)}>
                        {site.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-search-by">Search by</Label>
                <Select value={searchBy} onValueChange={(v) => setSearchBy(v as typeof searchBy)} name="searchBy">
                  <SelectTrigger id="att-search-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-search">Search</Label>
                <Input
                  id="att-search"
                  name="att-search"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-sm font-semibold text-foreground">Worker Attendance</h3>
              <span className="text-xs text-muted-foreground">{filteredWorkers.length} workers</span>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredWorkers.length === 0 ? (
                <EmptyState
                  title={selectedSiteId !== "all" ? "No workers found for this site" : "No workers found"}
                  description="Try a different site, date or search term."
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Daily rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mark attendance</TableHead>
                        <TableHead className="text-right">Today's earning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkers.map((worker, i) => (
                        <AnimatedItem as={TableRow} key={worker.userId} index={i}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
                              >
                                {worker.avatar}
                              </span>
                              <span className="font-medium">{worker.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={`View details for ${worker.name}`}
                                onClick={() => navigate(`/dashboard/employer/attendance/record-payment/${worker.userId}`)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{worker.role}</TableCell>
                          <TableCell>₹{worker.dailyRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_BADGE_CLASS[worker.attendance]}>
                              {STATUS_LABEL[worker.attendance]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {ATTENDANCE_OPTIONS.map((opt) => (
                                <Button
                                  key={opt.value}
                                  size="sm"
                                  variant={worker.attendance === opt.value ? "default" : "outline"}
                                  className="h-7 w-9 px-0 text-xs"
                                  disabled={processingIds.has(worker.userId)}
                                  aria-label={`Mark ${worker.name} as ${opt.label}`}
                                  aria-pressed={worker.attendance === opt.value}
                                  onClick={() => onAttendanceClick(worker, opt.value)}
                                >
                                  {processingIds.has(worker.userId) && worker.attendance === opt.value ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    opt.short
                                  )}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">₹{Math.round(calculateEarning(worker)).toLocaleString()}</div>
                            {worker.overtimeHours && (worker.attendance === "HALF_DAY" || worker.attendance === "ONE_AND_HALF_DAY") ? (
                              <div className="text-xs text-muted-foreground">+{worker.overtimeHours}h overtime</div>
                            ) : null}
                          </TableCell>
                        </AnimatedItem>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Dialog open={overtimeDialog !== null} onOpenChange={(open) => !open && setOvertimeDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{overtimeDialog?.type === "HALF_DAY" ? "Enter Working Details" : "Enter Overtime Details"}</DialogTitle>
            <DialogDescription>{overtimeDialog?.type === "HALF_DAY" ? "Half Day" : "1.5x Day"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ot-hours">{overtimeDialog?.type === "HALF_DAY" ? "Working hours" : "Overtime hours"}</Label>
              <Input
                id="ot-hours"
                type="number"
                step="0.5"
                min={0}
                placeholder="e.g. 2.5"
                value={overtimeDialog?.hours ?? ""}
                onChange={(e) => setOvertimeDialog((d) => (d ? { ...d, hours: e.target.value } : d))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ot-rate">Hourly rate</Label>
              <Input
                id="ot-rate"
                type="number"
                min={0}
                placeholder="Rate per hour"
                value={overtimeDialog?.rate ?? ""}
                onChange={(e) => setOvertimeDialog((d) => (d ? { ...d, rate: e.target.value } : d))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">
                {overtimeDialog?.hours || 0} hrs × ₹{overtimeDialog?.rate || 0}
              </span>
              <span className="font-semibold">₹{Math.round(overtimeTotal).toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOvertimeDialog(null)}>
              Cancel
            </Button>
            <Button onClick={submitOvertime}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
