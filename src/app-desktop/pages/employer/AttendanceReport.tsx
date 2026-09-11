import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import { useEmployerAttendanceReport } from "@/app-desktop/hooks/useEmployerReports";
import { downloadEmployerAttendanceReportExcel, downloadEmployerAttendanceReportPdf } from "@/app-desktop/api/employerReports.api";
import { ApiError } from "@/app-desktop/api/httpClient";

type FilterMode = "weekly" | "monthly" | "custom";

// percentagee pipe, verbatim: '0.00%' for null/NaN, else fixed(2) + '%'.
function formatPercent(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "0.00%";
  return `${value.toFixed(2)}%`;
}

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

function weeklyRange(): { start: Date; end: Date } {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(today);
  start.setDate(today.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function monthlyRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start, end };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function AttendanceReport() {
  const { session } = useAuth();
  const leaderId = session?.parentId ? Number(session.parentId) : undefined;

  const [filterMode, setFilterMode] = useState<FilterMode>("monthly");
  const [range, setRange] = useState(() => monthlyRange());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
  const [downloading, setDownloading] = useState<"PDF" | "EXCEL" | null>(null);

  const sitesQuery = useSites(session?.userId);
  const sites = sitesQuery.data ?? [];

  const query = useMemo(
    () => ({
      startDate: toIso(range.start),
      endDate: toIso(range.end),
      siteId: selectedSiteId === "all" ? undefined : selectedSiteId,
    }),
    [range, selectedSiteId],
  );

  const reportQuery = useEmployerAttendanceReport(leaderId, query);
  const rows = reportQuery.data ?? [];

  const totalDays = Math.floor((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const avgPresent = rows.length ? rows.reduce((sum, r) => sum + r.presentPercentage, 0) / rows.length : 0;
  const avgAbsent = rows.length ? rows.reduce((sum, r) => sum + r.absentPercentage, 0) / rows.length : 0;

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    setRange({ start: new Date(customStart), end: new Date(customEnd) });
  };

  const handleDownload = async (type: "PDF" | "EXCEL") => {
    if (!leaderId) return;
    setDownloading(type);
    try {
      const blob = type === "PDF" ? await downloadEmployerAttendanceReportPdf(leaderId, query) : await downloadEmployerAttendanceReportExcel(leaderId, query);
      triggerDownload(blob, `AttendanceReport_${query.startDate}_${query.endDate}.${type === "PDF" ? "pdf" : "xlsx"}`);
    } catch {
      toast.error(`Could not download ${type} report.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader eyebrow="Employer" title="Attendance Report" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={downloading !== null}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload("PDF")}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("EXCEL")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["weekly", "monthly", "custom"] as FilterMode[]).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={filterMode === mode ? "default" : "ghost"}
                  onClick={() => {
                    setFilterMode(mode);
                    if (mode === "weekly") setRange(weeklyRange());
                    if (mode === "monthly") setRange(monthlyRange());
                  }}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            {filterMode !== "custom" ? (
              <p className="text-sm text-muted-foreground">
                Date range: {range.start.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} –{" "}
                {range.end.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-auto" />
                <span className="text-muted-foreground">–</span>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-auto" />
                <Button size="sm" onClick={applyCustom}>
                  Apply
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ar-site">Site</Label>
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId} name="siteId">
              <SelectTrigger id="ar-site" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.siteId} value={String(site.siteId)}>
                    {site.siteName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Employees" value={rows.length} />
        <StatCard label="Total Days" value={totalDays} />
        <StatCard label="Average Present" value={formatPercent(avgPresent)} />
        <StatCard label="Average Absent" value={formatPercent(avgAbsent)} />
      </div>

      <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        {reportQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : reportQuery.isError ? (
          <ErrorState
            message={reportQuery.error instanceof ApiError ? reportQuery.error.message : "Could not load the attendance report."}
            onRetry={() => reportQuery.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState title="No attendance records" description="No records were found for this date range." />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Present %</TableHead>
                  <TableHead className="text-right">Absent %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.phone || "—"}</TableCell>
                    <TableCell className="text-emerald-600">{row.present}</TableCell>
                    <TableCell className="text-red-600">{row.absent}</TableCell>
                    <TableCell>{formatPercent(row.presentPercentage)}</TableCell>
                    <TableCell className="text-right">{formatPercent(row.absentPercentage)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
