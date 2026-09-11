import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import { useEmployerPaymentReport } from "@/app-desktop/hooks/useEmployerReports";
import { ApiError } from "@/app-desktop/api/httpClient";

type FilterMode = "monthly" | "custom";

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

function monthlyRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start, end };
}

// Angular's payment-report.component.ts intentionally has no Weekly tab
// (only Monthly/Custom) — a real, confirmed difference from the
// Attendance Report, not an omission in this port.
export default function PaymentReport() {
  const { session } = useAuth();
  const leaderId = session?.parentId ? Number(session.parentId) : undefined;

  const [filterMode, setFilterMode] = useState<FilterMode>("monthly");
  const [range, setRange] = useState(() => monthlyRange());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedSiteName, setSelectedSiteName] = useState<string>("all");

  const sitesQuery = useSites(session?.userId);
  const sites = sitesQuery.data ?? [];
  const selectedSite = sites.find((s) => s.siteName === selectedSiteName);

  const query = useMemo(
    () => ({
      startDate: toIso(range.start),
      endDate: toIso(range.end),
      siteId: selectedSiteName === "all" ? undefined : String(selectedSite?.siteId ?? ""),
    }),
    [range, selectedSiteName, selectedSite],
  );

  const reportQuery = useEmployerPaymentReport(leaderId, query);
  const rows = reportQuery.data ?? [];

  const totalEarnings = rows.reduce((sum, r) => sum + r.totalEarned, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.totalPaid, 0);
  const totalPending = rows.reduce((sum, r) => sum + r.currentBalance, 0);

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    setRange({ start: new Date(customStart), end: new Date(customEnd) });
  };

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageHeader eyebrow="Employer" title="Payment Report" />
          <p className="mt-1 text-sm text-muted-foreground">All payment data up to {today}</p>
        </div>
        {/*
          Download is intentionally disabled: live verification confirmed
          the real backend endpoint this button must call
          (/v1/authenticate/subordinates/PaymentReport/pdf|excel, with the
          literal `?siteId=' '`/`?siteId=''` querystring preserved from
          report.service.ts) returns HTTP 401 for this account. Angular has
          no global 401-triggered logout (see AuthContext.tsx), so this
          broken endpoint fails silently there; in React the shared
          httpClient's global 401 handler would sign the admin out entirely.
          Disabled here rather than wired to a button proven to destroy the
          user's session — the backend issue is documented, not silently
          worked around by inventing a corrected URL.
        */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Export is temporarily unavailable — this backend endpoint is currently returning an error.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {(["monthly", "custom"] as FilterMode[]).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={filterMode === mode ? "default" : "ghost"}
                  onClick={() => {
                    setFilterMode(mode);
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
            <Label htmlFor="pr-site">Site</Label>
            <Select value={selectedSiteName} onValueChange={setSelectedSiteName} name="siteName">
              <SelectTrigger id="pr-site" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.siteId} value={site.siteName}>
                    {site.siteName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Workers" value={rows.length} />
        <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <StatCard label="Total Pending" value={`₹${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
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
            message={reportQuery.error instanceof ApiError ? reportQuery.error.message : "Could not load the payment report."}
            onRetry={() => reportQuery.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState title="No payment records" description="No records were found for this date range." />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Days worked</TableHead>
                  <TableHead>Daily wage</TableHead>
                  <TableHead className="text-emerald-600">Paid</TableHead>
                  <TableHead className="text-right text-red-600">Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.workerId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.daysWorked}</TableCell>
                    <TableCell>₹{row.rate.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600">₹{row.totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">₹{row.currentBalance.toLocaleString()}</TableCell>
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
