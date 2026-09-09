import { useMemo, useState } from "react";
import { IndianRupee, Wallet, HandCoins, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { StatusBadge } from "@/app-desktop/components/shared/StatusBadge";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { ExportButtons } from "@/app-desktop/components/shared/ExportButtons";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { usePayments } from "@/app-desktop/hooks/usePayments";
import { useSites } from "@/app-desktop/hooks/useSites";
import { exportPaymentsExcel, exportPaymentsPdf } from "@/app-desktop/api/payments.api";
import { isValidDateRange } from "@/app-desktop/utils/dateRange";
import { ApiError } from "@/app-desktop/api/httpClient";

const ALL = "__all__";

const STATUS_COLORS: Record<string, string> = {
  Paid: "border-transparent bg-emerald-100 text-emerald-800",
  Partial: "border-transparent bg-amber-100 text-amber-800",
  Pending: "border-transparent bg-pink-100 text-pink-800",
};

// Verified against the real Angular template (payments.html): this tab
// only toggles a CSS `active` class on the tab buttons themselves (3
// bindings, nothing else) — it has zero effect on data, grouping, or
// filtering anywhere in the component. Confirmed cosmetic-only; rendered
// here the same way, with no behavioral branching to match.
const VIEW_TABS = ["All", "Site-wise", "Site Manager-wise"] as const;

export default function Payments() {
  const { session } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSite, setSelectedSite] = useState(ALL);
  const [selectedManager, setSelectedManager] = useState(ALL);
  const [selectedWorker, setSelectedWorker] = useState(ALL);
  const [activeTab, setActiveTab] = useState<(typeof VIEW_TABS)[number]>("All");

  const paymentsQuery = usePayments({ enterpriseId: session?.userId, startDate, endDate });
  const sitesQuery = useSites(session?.userId);
  const records = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);

  // Verified against the real Angular template (payments.html): the Site
  // filter's options come from MasterDataService.getSites(), not from
  // unique values in loaded records — only Site Manager does that.
  const sites = sitesQuery.data ?? [];
  const uniqueManagers = useMemo(
    () => Array.from(new Set(records.map((r) => r.siteManager).filter((v) => v !== "—"))),
    [records],
  );
  const uniqueWorkers = useMemo(
    () => Array.from(new Set(records.map((r) => r.worker).filter((v) => v !== "—"))),
    [records],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const siteMatch = selectedSite === ALL || r.site.trim().toLowerCase() === selectedSite.trim().toLowerCase();
      const managerMatch =
        selectedManager === ALL || r.siteManager.trim().toLowerCase() === selectedManager.trim().toLowerCase();
      const workerMatch = selectedWorker === ALL || r.worker === selectedWorker;
      return siteMatch && managerMatch && workerMatch;
    });
  }, [records, selectedSite, selectedManager, selectedWorker]);

  // Aggregate tiles are computed over the currently loaded (unfiltered) set
  // in the Angular source, not the filtered one used for the table — that
  // distinction is intentional and preserved here.
  const summary = useMemo(
    () => ({
      // Sums dailyWage, matching the Angular source's currently-active code.
      // An earlier, dead, commented-out version summed `earnings` instead —
      // flagged in the migration blueprint as needing business sign-off.
      // Preserved as-is per that guidance: use the live behavior, flag the
      // ambiguity rather than silently picking a different figure.
      totalLabourCost: records.reduce((sum, r) => sum + r.dailyWage, 0),
      totalPaid: records.reduce((sum, r) => sum + r.current, 0),
      advancePaid: records.reduce((sum, r) => sum + r.advance, 0),
      remainingDue: records.reduce((sum, r) => sum + r.due, 0),
      pendingPayments: records.filter((r) => r.status !== "Paid").length,
    }),
    [records],
  );

  const exportEnabled = isValidDateRange(startDate, endDate);
  const exportQuery = { enterpriseId: session?.userId ?? "", startDate, endDate };
  const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="text-sm text-muted-foreground">Worker payment ledger for the selected date range.</p>
        </div>
        <ExportButtons
          disabled={!exportEnabled}
          disabledReason="Select a start and end date to export"
          fetchPdf={() => exportPaymentsPdf(exportQuery)}
          fetchExcel={() => exportPaymentsExcel(exportQuery)}
          filenameBase={`PaymentReport_${startDate || "all"}_${endDate || "all"}`}
        />
      </div>

      <div
        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
        role="note"
      >
        "Total Labour Cost" below sums each worker's daily wage. The Angular source has a dead, commented-out
        alternative that summed earnings instead — this figure needs business sign-off before being treated as
        final (see MIGRATION_TO_REACT.md §14).
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Labour Cost" value={currency(summary.totalLabourCost)} icon={IndianRupee} />
        <StatCard label="Total Paid" value={currency(summary.totalPaid)} icon={Wallet} />
        <StatCard label="Advance Paid" value={currency(summary.advancePaid)} icon={HandCoins} />
        <StatCard label="Remaining Due" value={currency(summary.remainingDue)} icon={AlertCircle} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as (typeof VIEW_TABS)[number])}>
        <TabsList>
          {VIEW_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
                {sites.map((site) => (
                  <SelectItem key={site.siteId} value={site.siteName}>
                    {site.siteName}
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
            <Label>Worker</Label>
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All workers</SelectItem>
                {uniqueWorkers.map((worker) => (
                  <SelectItem key={worker} value={worker}>
                    {worker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {paymentsQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : paymentsQuery.isError ? (
            <ErrorState
              message={
                paymentsQuery.error instanceof ApiError ? paymentsQuery.error.message : "Could not load payment data."
              }
              onRetry={() => paymentsQuery.refetch()}
            />
          ) : filteredRecords.length === 0 ? (
            <EmptyState title="No payments" description="No payment records match the selected date range and filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Site Manager</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Daily Wage</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Advance</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Last Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.payoutId}>
                      <TableCell className="font-medium">{record.worker}</TableCell>
                      <TableCell>{record.role}</TableCell>
                      <TableCell>{record.site}</TableCell>
                      <TableCell>{record.siteManager}</TableCell>
                      <TableCell>{record.attendance}</TableCell>
                      <TableCell>{currency(record.dailyWage)}</TableCell>
                      <TableCell>{currency(record.earnings)}</TableCell>
                      <TableCell>{currency(record.advance)}</TableCell>
                      <TableCell>{currency(record.current)}</TableCell>
                      <TableCell>{currency(record.due)}</TableCell>
                      <TableCell>{record.lastPaid}</TableCell>
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
