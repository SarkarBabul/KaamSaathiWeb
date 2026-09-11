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
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { ChartCard } from "@/app-desktop/components/dashboard/ChartCard";
import { BentoCard, BentoGrid, BENTO_SPAN_CLASS } from "@/app-desktop/components/fx/Bento";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { FadeContent } from "@/app-desktop/components/fx/FadeContent";
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
//
// Layout: the primary KPI (TOTAL SITES, the one figure Enterprise checks
// first) leads a Bento composition instead of six identical tiles; the two
// least-certain numbers (TODAY'S ATTENDANCE, TODAY'S LABOUR COST — see the
// explicit "no API" framing below) get the restrained ambient glow, an
// honest visual cue that these are the ones still catching up to the rest
// of the dashboard's real data.
interface StatTile {
  label: string;
  icon: LucideIcon;
  value: string;
  subtext?: string;
  loading: boolean;
}

const ATTENDANCE_VIEWS = ["Daily", "Weekly", "Monthly"] as const;

// Metrics whose API field isn't bound yet render as 0 rather than an em dash,
// which read as broken on the live dashboard. This fallback is deliberately
// local to this page — it is NOT a global "render 0 for any missing number"
// rule, and it never overwrites a real API value.
const UNBOUND_METRIC_PLACEHOLDER = "0";

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) return UNBOUND_METRIC_PLACEHOLDER;
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

  const totalSites = siteSummary.data?.totalSites;

  // The four real, API-backed supporting metrics — same shape, same
  // (accent) tone, differing only by label/icon/value, which is exactly
  // the restraint that makes the Bento row read as one family rather than
  // four unrelated colored blocks.
  const secondaryTiles: StatTile[] = [
    {
      label: "ACTIVE SITES",
      icon: Building2,
      value: formatNumber(siteSummary.data?.activeSites),
      loading: siteSummary.isLoading,
    },
    {
      label: "SITE MANAGERS",
      icon: Users,
      value: formatNumber(siteSummary.data?.siteManagers),
      loading: siteSummary.isLoading,
    },
    {
      label: "TOTAL WORKERS",
      icon: HardHat,
      value: formatNumber(attendanceSummary.data?.totalWorkers),
      loading: attendanceSummary.isLoading,
    },
    {
      label: "TODAY'S ATTENDANCE",
      icon: CalendarCheck,
      value: formatNumber(attendanceSummary.data?.presentToday),
      subtext:
        attendanceSummary.data?.attendancePercentage !== undefined
          ? `Present · ${attendanceSummary.data.attendancePercentage}%`
          : undefined,
      loading: attendanceSummary.isLoading,
    },
  ];

  // The one genuinely unbound metric (no backing endpoint anywhere in
  // Angular either — see file-level comment) gets a visibly different,
  // de-emphasized treatment below instead of sitting among the four real
  // numbers above as if it were a fifth equal KPI.
  const labourCostTile = {
    value: UNBOUND_METRIC_PLACEHOLDER,
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Super Admin" title="Dashboard" trailing={today} />

      {/* KPI BENTO — a deliberate two-tier hierarchy instead of a wall of
          equally-loud color blocks:
            1. ONE dominant card (Total Sites, the figure Enterprise checks
               first) in the brand orange gradient, with the ambient Border
               Glow reserved for exactly this card.
            2. FOUR real, API-backed supporting metrics as neutral white
               StatCards sharing one accent hue (the workspace orange, via
               tone="accent") — differentiated by icon and label only, not
               by each getting its own random hue. That shared restraint is
               what reads as "one coherent composition" instead of a
               rainbow of saturated tiles.
          Hero spans 6 of 12 columns × 2 rows; the four StatCards fill the
          remaining 6 columns as a 2×2 grid (3 cols × 2 rows each) — grid
          auto-stretch matches their combined height to the hero's exactly,
          so there is no leftover cell and no card taller than its content
          needs to justify. */}
      <BentoGrid>
        <BentoCard
          span="half-tall"
          index={0}
          ambient
          lift
          bare
          className={cn(
            "flex flex-col justify-between rounded-[20px] bg-gradient-to-br p-6 text-white",
            "from-[oklch(72%_.18_55)] to-[oklch(60%_.22_30)]",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide opacity-90">TOTAL SITES</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
              <Building2 className="h-[18px] w-[18px]" />
            </span>
          </div>
          <div>
            <span className="text-[52px] font-bold leading-none tabular-nums">
              {siteSummary.isLoading ? "…" : formatNumber(totalSites)}
            </span>
            <p className="mt-2.5 text-[13px] opacity-90">Across the whole enterprise account</p>
          </div>
        </BentoCard>

        {secondaryTiles.map((tile, i) => (
          <StatCard
            key={tile.label}
            index={i + 1}
            label={tile.label}
            value={tile.value}
            icon={tile.icon}
            hint={tile.subtext}
            tone="accent"
            loading={tile.loading}
            className={BENTO_SPAN_CLASS.quarter}
          />
        ))}
      </BentoGrid>

      {/* TODAY'S LABOUR COST has no backing endpoint at all (see file-level
          comment) — deliberately NOT styled as a fifth KPI tile competing
          with four real numbers. A compact, dashed, muted status strip
          keeps the "0" honest (never a fabricated figure) while visually
          reading as "not live yet" rather than "zero labour cost today". */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#e5cdbd] bg-[#fff8f4] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[hsl(var(--accent))]">
            <Briefcase className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Today's Labour Cost</p>
            <p className="text-[12px] text-muted-foreground">Not connected · no API</p>
          </div>
        </div>
        <span className="text-2xl font-bold tabular-nums text-foreground">{labourCostTile.value}</span>
      </div>

      {/* ATTENDANCE TREND + WORKER ROLE DISTRIBUTION — the dashboard's first
          below-the-fold section on most laptop screens, so it resolves into
          view as the user scrolls to it rather than all at once with the
          KPI row above. */}
      <FadeContent className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
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
      </FadeContent>

      {/* EXPENSE VS INCOME + SITE-WISE LABOUR */}
      <FadeContent className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
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
      </FadeContent>

      {/* QUICK ACTIONS + AI INSIGHTS */}
      <FadeContent className="grid grid-cols-1 gap-4 xl:grid-cols-[65%_1fr]">
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
          <ul className="mb-3.5 flex flex-col gap-2.5">
            {MOCK_AI_INSIGHTS.map((insight, i) => (
              <AiInsightItem key={insight.title} insight={insight} index={i} />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigate("/enterprise/ai-dashboard")}
            className="w-full rounded-[10px] border-[1.5px] border-[#e5e5e5] bg-white py-2.5 text-[13px] font-semibold text-[#1c2836] transition-colors hover:border-[#d0d0d0] hover:bg-[#f7f8fa]"
          >
            Open AI Dashboard
          </button>
        </ChartCard>
      </FadeContent>
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

function AiInsightItem({ insight, index }: { insight: (typeof MOCK_AI_INSIGHTS)[number]; index: number }) {
  const style = SEVERITY_STYLES[insight.severity];
  const Icon = style.icon;
  return (
    <AnimatedItem as="li" index={index} interactive className={cn("flex items-start gap-2.5 rounded-[10px] p-3.5", style.bg)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.fg)} />
      <div className="min-w-0">
        <strong className={cn("block text-[13px] font-semibold", style.fg)}>{insight.title}</strong>
        <p className="mt-0.5 text-[11.5px] text-[#666]">{insight.detail}</p>
      </div>
    </AnimatedItem>
  );
}
