import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileDown,
  FileText,
  HardHat,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { ChartCard } from "@/app-desktop/components/dashboard/ChartCard";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useDashboardSummary } from "@/app-desktop/hooks/useDashboardSummary";
import {
  MOCK_AI_INSIGHTS,
  MOCK_ATTENDANCE_TREND,
  MOCK_FINANCE_TREND,
  MOCK_SITE_LABOUR,
  MOCK_WORKER_ROLES,
} from "@/app-desktop/data/dashboardMockData";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Visually matches the Angular source's dashboard.component (stats-grid,
// Attendance Trend / Worker Role Distribution / Expense vs Income /
// Site-wise Labour cards, Quick Actions, AI Insights). Site summary and
// worker attendance stat tiles are real, API-backed data (wired via
// useDashboardSummary). TODAY'S LABOUR COST has no backing endpoint in
// Angular either (its `labourCost` signal is initialized to 0 and never
// set), so it's honestly marked not-connected rather than showing a
// fabricated number. The four chart sections, Quick Actions subtext, and AI
// Insights all render from src/app-desktop/data/dashboardMockData.ts —
// isolated, clearly-named mock data — because Angular's own chart series
// are hardcoded signal defaults with no backend wiring (confirmed in the
// Phase-3 API audit). The Expense vs Income chart stays on that same mock
// data deliberately: the live monthly-finance-summary endpoint it would
// otherwise use 401s on the real backend (see dashboard.api.ts), so it is
// not called at all rather than logging the session out.
interface StatTile {
  label: string;
  icon: LucideIcon;
  gradient: string;
  value: string;
  subtext?: string;
  loading: boolean;
}

const ATTENDANCE_VIEWS = ["Daily", "Weekly", "Monthly"] as const;

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-IN");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { siteSummary, attendanceSummary } = useDashboardSummary(session?.userId);
  const [attendanceView, setAttendanceView] = useState<(typeof ATTENDANCE_VIEWS)[number]>("Daily");

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  const statTiles: StatTile[] = [
    {
      label: "TOTAL SITES",
      icon: Building2,
      gradient: "from-[oklch(72%_.18_55)] to-[oklch(60%_.22_30)]",
      value: formatNumber(siteSummary.data?.totalSites),
      loading: siteSummary.isLoading,
    },
    {
      label: "ACTIVE SITES",
      icon: Building2,
      gradient: "from-[oklch(75%_.16_155)] to-[oklch(55%_.16_175)]",
      value: formatNumber(siteSummary.data?.activeSites),
      loading: siteSummary.isLoading,
    },
    {
      label: "SITE MANAGERS",
      icon: Users,
      gradient: "from-[oklch(70%_.14_235)] to-[oklch(50%_.18_260)]",
      value: formatNumber(siteSummary.data?.siteManagers),
      loading: siteSummary.isLoading,
    },
    {
      label: "TOTAL WORKERS",
      icon: HardHat,
      gradient: "from-[oklch(82%_.16_90)] to-[oklch(65%_.19_55)]",
      value: formatNumber(attendanceSummary.data?.totalWorkers),
      loading: attendanceSummary.isLoading,
    },
    {
      label: "TODAY'S ATTENDANCE",
      icon: CalendarCheck,
      gradient: "from-[oklch(75%_.16_155)] to-[oklch(55%_.16_175)]",
      value: formatNumber(attendanceSummary.data?.presentToday),
      subtext:
        attendanceSummary.data?.attendancePercentage !== undefined
          ? `Present · ${attendanceSummary.data.attendancePercentage}%`
          : undefined,
      loading: attendanceSummary.isLoading,
    },
    {
      label: "TODAY'S LABOUR COST",
      icon: Briefcase,
      gradient: "from-[oklch(75%_.17_15)] to-[oklch(60%_.21_350)]",
      value: "—",
      subtext: "Not connected · no API",
      loading: false,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Super Admin" title="Dashboard" trailing={today} />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              "flex min-h-[140px] flex-col justify-between rounded-[20px] bg-gradient-to-br p-5 text-white",
              tile.gradient,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide opacity-90">{tile.label}</span>
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-white/25">
                <tile.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-[30px] font-bold leading-none">{tile.loading ? "…" : tile.value}</span>
              {tile.subtext && <p className="mt-1 text-[12.5px] opacity-90">{tile.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ATTENDANCE TREND + WORKER ROLE DISTRIBUTION */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
        <ChartCard
          title="Attendance Trend"
          subtitle="Present vs absent · last 7 days"
          action={
            <div className="flex shrink-0 gap-1 rounded-full bg-[#f4f4f4] p-1">
              {ATTENDANCE_VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setAttendanceView(view)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    attendanceView === view ? "bg-[#1c2836] text-white" : "text-[#6b7280] hover:bg-[#e8e8e8]",
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ATTENDANCE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="absentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4aa8ff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4aa8ff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9aa5b1" }} />
                <YAxis
                  domain={[0, 600]}
                  tickCount={5}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9aa5b1" }}
                />
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke="#ff6b35"
                  strokeWidth={3}
                  fill="url(#presentFill)"
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  name="Absent"
                  stroke="#4aa8ff"
                  strokeWidth={3}
                  fill="url(#absentFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Worker Role Distribution" subtitle="Mistry / Helper / Electrician & more">
          <div className="mx-auto h-[200px] max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_WORKER_ROLES}
                  dataKey="count"
                  nameKey="role"
                  innerRadius="55%"
                  outerRadius="85%"
                  stroke="none"
                >
                  {MOCK_WORKER_ROLES.map((slice) => (
                    <Cell key={slice.role} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {MOCK_WORKER_ROLES.map((slice) => (
              <div key={slice.role} className="flex items-center justify-between text-[13.5px] font-semibold text-[#4b5563]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                  {slice.role}
                </span>
                <span>{slice.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* EXPENSE VS INCOME + SITE-WISE LABOUR */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
        <ChartCard title="Expense vs Income" subtitle="Last 6 months · in ₹ Lakhs">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MOCK_FINANCE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9aa5b1" }} />
                <YAxis
                  domain={[0, 28]}
                  tickCount={5}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9aa5b1" }}
                />
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
                <Bar dataKey="income" name="income" fill="#1fa570" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="expense" name="expense" fill="#ff6b35" radius={[6, 6, 0, 0]} barSize={18} />
                <Line type="monotone" dataKey="income" name="income trend" stroke="#1a6b46" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Site-wise Labour" subtitle="Workers deployed today">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={MOCK_SITE_LABOUR}
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="site"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11.5, fill: "#4b5563" }}
                />
                <Tooltip />
                <Bar dataKey="workers" name="Workers" fill="oklch(50% .18 260)" radius={[0, 5, 5, 0]} barSize={16} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* QUICK ACTIONS + AI INSIGHTS */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
        <ChartCard title="Quick Actions" subtitle="Frequently used admin tools">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <QuickActionButton
              icon={UserPlus}
              tint="bg-[#e8f2ff] text-[#2f7fe0]"
              label="Add Site Manager"
              onClick={() => navigate("/enterprise/user-management")}
            />
            <QuickActionButton
              icon={Building2}
              tint="bg-[#f2e8ff] text-[#8b3fe0]"
              label="Create New Site"
              onClick={() => navigate("/enterprise/site-management")}
            />
            <QuickActionButton
              icon={FileText}
              tint="bg-[#e5f8f0] text-[#17a085]"
              label="View Reports"
              onClick={() => navigate("/enterprise/reports")}
            />
            <QuickActionButton
              icon={FileDown}
              tint="bg-[#fff2e5] text-[#ff6b35]"
              label="Export Reports"
              onClick={() => navigate("/enterprise/reports")}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="AI Insights"
          subtitle="Auto-generated alerts"
          action={
            <span className="flex shrink-0 items-center gap-1 rounded-[10px] bg-[#fdeaec] px-2.5 py-1 text-[10px] font-semibold text-[#e74c3c]">
              ● Live
            </span>
          }
        >
          <div className="mb-3.5 flex flex-col gap-2.5">
            {MOCK_AI_INSIGHTS.map((insight) => (
              <AiInsightItem key={insight.title} insight={insight} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/enterprise/ai-dashboard")}
            className="w-full rounded-[10px] border-[1.5px] border-[#e5e5e5] bg-white py-2.5 text-[13px] font-semibold text-[#1c2836] transition-colors hover:border-[#d0d0d0] hover:bg-[#f7f8fa]"
          >
            Open AI Dashboard
          </button>
        </ChartCard>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  tint,
  label,
  onClick,
}: {
  icon: LucideIcon;
  tint: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2.5 rounded-[10px] bg-[#f7f8fa] p-3.5 text-left transition-colors hover:bg-[#eef0f3]"
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px]", tint)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[#1c2836]">{label}</span>
        <span className="block truncate text-[11px] text-[#9aa5b1]">One-click</span>
      </span>
      <span className="shrink-0 text-base text-[#9aa5b1]">+</span>
    </button>
  );
}

const SEVERITY_STYLES = {
  danger: { bg: "bg-[#fdeaec]", fg: "text-[#e74c3c]", icon: AlertTriangle },
  warning: { bg: "bg-[#fff8e8]", fg: "text-[#d98a13]", icon: AlertTriangle },
  success: { bg: "bg-[#e5f8f0]", fg: "text-[#17a085]", icon: CheckCircle2 },
} as const;

function AiInsightItem({ insight }: { insight: (typeof MOCK_AI_INSIGHTS)[number] }) {
  const style = SEVERITY_STYLES[insight.severity];
  const Icon = style.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-[10px] p-3.5", style.bg)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.fg)} />
      <div className="min-w-0">
        <strong className={cn("block text-[13px] font-semibold", style.fg)}>{insight.title}</strong>
        <p className="mt-0.5 text-[11.5px] text-[#666]">{insight.detail}</p>
      </div>
    </div>
  );
}
