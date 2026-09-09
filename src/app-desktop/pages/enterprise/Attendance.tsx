import { useMemo, useState } from "react";
import { Users, UserCheck, UserX, Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { StatusBadge } from "@/app-desktop/components/shared/StatusBadge";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { ExportButtons } from "@/app-desktop/components/shared/ExportButtons";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useAttendance } from "@/app-desktop/hooks/useAttendance";
import { exportAttendanceExcel, exportAttendancePdf } from "@/app-desktop/api/attendance.api";
import { isValidDateRange } from "@/app-desktop/utils/dateRange";
import { ApiError } from "@/app-desktop/api/httpClient";

const ALL = "__all__";

const STATUS_COLORS: Record<string, string> = {
  Present: "border-transparent bg-emerald-100 text-emerald-800",
  Absent: "border-transparent bg-red-100 text-red-800",
  Overtime: "border-transparent bg-blue-100 text-blue-800",
  "Half Day": "border-transparent bg-amber-100 text-amber-800",
};

export default function Attendance() {
  const { session } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSite, setSelectedSite] = useState(ALL);
  const [selectedManager, setSelectedManager] = useState(ALL);
  const [selectedRole, setSelectedRole] = useState(ALL);

  const attendanceQuery = useAttendance({ userId: session?.userId, startDate, endDate });
  const records = useMemo(() => attendanceQuery.data ?? [], [attendanceQuery.data]);

  // Derived exactly like the Angular page: filter dropdown options come
  // from the currently-loaded records, not a separate lookup call, and
  // exclude the "—" placeholder used for missing values.
  const uniqueSites = useMemo(
    () => Array.from(new Set(records.map((r) => r.site).filter((v) => v !== "—"))),
    [records],
  );
  const uniqueManagers = useMemo(
    () => Array.from(new Set(records.map((r) => r.siteManager).filter((v) => v !== "—"))),
    [records],
  );
  const uniqueRoles = useMemo(
    () => Array.from(new Set(records.map((r) => r.workerRole).filter((v) => v !== "—"))),
    [records],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const siteMatch = selectedSite === ALL || r.site.trim().toLowerCase() === selectedSite.trim().toLowerCase();
      const managerMatch =
        selectedManager === ALL || r.siteManager.trim().toLowerCase() === selectedManager.trim().toLowerCase();
      const roleMatch = selectedRole === ALL || r.workerRole === selectedRole;
      return siteMatch && managerMatch && roleMatch;
    });
  }, [records, selectedSite, selectedManager, selectedRole]);

  const summary = useMemo(
    () => ({
      totalWorkers: filteredRecords.length,
      presentCount: filteredRecords.filter((r) => r.status === "Present").length,
      absentCount: filteredRecords.filter((r) => r.status === "Absent").length,
      halfDayCount: filteredRecords.filter((r) => r.status === "Half Day").length,
      overtimeCount: filteredRecords.filter((r) => r.status === "Overtime").length,
    }),
    [filteredRecords],
  );

  const exportEnabled = isValidDateRange(startDate, endDate);
  const exportQuery = { userId: session?.userId ?? "", startDate, endDate };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Site-wise worker attendance for the selected date range.</p>
        </div>
        <ExportButtons
          disabled={!exportEnabled}
          disabledReason="Select a start and end date to export"
          fetchPdf={() => exportAttendancePdf(exportQuery)}
          fetchExcel={() => exportAttendanceExcel(exportQuery)}
          filenameBase={`AttendanceReport_${startDate || "all"}_${endDate || "all"}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Workers" value={summary.totalWorkers} icon={Users} />
        <StatCard label="Present" value={summary.presentCount} icon={UserCheck} />
        <StatCard label="Absent" value={summary.absentCount} icon={UserX} />
        <StatCard label="Half Day" value={summary.halfDayCount} icon={Clock} />
        <StatCard label="Overtime" value={summary.overtimeCount} icon={Timer} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Site</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All sites</SelectItem>
                {uniqueSites.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Site manager</Label>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All managers</SelectItem>
                {uniqueManagers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {attendanceQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : attendanceQuery.isError ? (
            <ErrorState
              message={
                attendanceQuery.error instanceof ApiError
                  ? attendanceQuery.error.message
                  : "Could not load attendance data."
              }
              onRetry={() => attendanceQuery.refetch()}
            />
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="No records match the selected date range and filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Site Manager</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow key={`${record.workerId}-${record.date}-${index}`}>
                      <TableCell className="font-medium">{record.workerName}</TableCell>
                      <TableCell>{record.workerRole}</TableCell>
                      <TableCell>{record.site}</TableCell>
                      <TableCell>{record.siteManager}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} colorMap={STATUS_COLORS} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
