import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  HardHat,
  IndianRupee,
  MapPin,
  Receipt,
  TrendingDown,
  TrendingUp,
  UserCircle,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { BentoCard, BentoGrid } from "@/app-desktop/components/fx/Bento";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { FadeContent } from "@/app-desktop/components/fx/FadeContent";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import { useEmployerAttendanceByDate, useEmployerAttendanceWorkers } from "@/app-desktop/hooks/useEmployerAttendance";
import { useExpenseAmount, useExpenseTransactions } from "@/app-desktop/hooks/useExpenseTracker";
import { applyAttendanceRecords, calculateEarning } from "@/app-desktop/utils/attendanceEarning";
import { cn } from "@/lib/utils";

// The Angular employer/home is an 8-card module grid with no API of its
// own. That grid is preserved in full below; around it, the page now also
// surfaces a real "today" snapshot composed purely from read endpoints the
// other employer pages already call (sites, worker roster, today's
// attendance, expense summary and ledger) — the same queries, cached by
// react-query, so opening Attendance or Expense Tracker afterwards is
// instant. Nothing here is fabricated: every figure is either live data or
// an explicit loading/unavailable state.
interface HomeModule {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const HOME_MODULES: HomeModule[] = [
  { to: "/dashboard/employer/employee-management", label: "Add Employee", description: "Add and manage your workforce.", icon: UserPlus, accent: "#7c3aed" },
  { to: "/dashboard/employer/attendance", label: "Attendance Module", description: "Track attendance and manage worker payments.", icon: CalendarCheck, accent: "#1c7a3d" },
  { to: "/dashboard/profile", label: "Profile", description: "View your account and profile details.", icon: UserCircle, accent: "#e11d48" },
  { to: "/dashboard/employer/site-management", label: "Site", description: "Manage your work sites and assignments.", icon: Building2, accent: "#0f766e" },
  { to: "/dashboard/employer/plan", label: "Pricing", description: "View plans and manage your subscription.", icon: CreditCard, accent: "#4338ca" },
  { to: "/dashboard/employer/reports", label: "Reports", description: "Review attendance and payment reports.", icon: FileBarChart, accent: "#a21caf" },
  { to: "/dashboard/employer/expense-tracker", label: "Expense Tracker", description: "Track income and business expenses.", icon: Receipt, accent: "#e8940f" },
  { to: "/dashboard/employer/ai-chat", label: "AI Beta", description: "Ask KaamSaathi AI about your workforce data.", icon: Bot, accent: "#2563eb" },
];

const UNAVAILABLE = "—";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function rupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

interface Figure {
  value: string;
  loading: boolean;
}

function figure(loading: boolean, error: boolean, value: () => string): Figure {
  if (loading) return { value: "…", loading: true };
  if (error) return { value: UNAVAILABLE, loading: false };
  return { value: value(), loading: false };
}

export default function EmployerHome() {
  const { session } = useAuth();
  const leaderId = session?.parentId ? Number(session.parentId) : 0;
  const today = todayIso();

  const sitesQuery = useSites(session?.userId);
  const workersQuery = useEmployerAttendanceWorkers(session?.parentId, "all", leaderId);
  const attendanceQuery = useEmployerAttendanceByDate(session?.parentId, today);
  const amountQuery = useExpenseAmount(session?.userId);
  const transactionsQuery = useExpenseTransactions(session?.userId);

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const workers = useMemo(
    () => applyAttendanceRecords(workersQuery.data ?? [], attendanceQuery.data ?? []),
    [workersQuery.data, attendanceQuery.data],
  );
  const presentCount = workers.filter((w) => w.attendance !== "ABSENT").length;
  const wagesToday = workers.reduce((sum, w) => sum + calculateEarning(w), 0);
  const attendanceReady = workersQuery.isSuccess && attendanceQuery.isSuccess;
  const attendanceError = workersQuery.isError || attendanceQuery.isError;
  const attendanceLoading = !attendanceReady && !attendanceError;
  const attendancePct = workers.length > 0 ? Math.round((presentCount / workers.length) * 100) : 0;

  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);
  const recentTransactions = useMemo(() => (transactionsQuery.data ?? []).slice(0, 5), [transactionsQuery.data]);
  const siteNameById = useMemo(() => new Map(sites.map((s) => [s.siteId, s.siteName])), [sites]);

  const snapshot: { label: string; icon: LucideIcon; fig: Figure; to: string }[] = [
    {
      label: "Sites",
      icon: Building2,
      fig: figure(sitesQuery.isLoading, sitesQuery.isError, () => String(sites.length)),
      to: "/dashboard/employer/site-management",
    },
    {
      label: "Workers",
      icon: HardHat,
      fig: figure(workersQuery.isLoading, workersQuery.isError, () => String(workersQuery.data?.length ?? 0)),
      to: "/dashboard/employer/employee-management",
    },
    {
      label: "Present today",
      icon: CalendarCheck,
      fig: figure(attendanceLoading, attendanceError, () => String(presentCount)),
      to: "/dashboard/employer/attendance",
    },
    {
      label: "Wages today",
      icon: IndianRupee,
      fig: figure(attendanceLoading, attendanceError, () => rupees(wagesToday)),
      to: "/dashboard/employer/attendance",
    },
  ];

  const balance = figure(amountQuery.isLoading, amountQuery.isError, () => rupees(amountQuery.data?.availableBalance ?? 0));
  const dues = figure(amountQuery.isLoading, amountQuery.isError, () => rupees(amountQuery.data?.totalDue ?? 0));
  const received = figure(amountQuery.isLoading, amountQuery.isError, () => rupees(amountQuery.data?.totalReceived ?? 0));
  const spent = figure(amountQuery.isLoading, amountQuery.isError, () => rupees(amountQuery.data?.totalSpent ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employer" title="Dashboard" trailing={todayLabel} />

      {/* ── Today ─────────────────────────────────────────────────────── */}
      <BentoGrid>
        <BentoCard span="hero" index={0} className="flex flex-col justify-between p-6 sm:p-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-[28px]" style={{ fontFamily: "var(--ks-display-font)" }}>
              {greeting()}
              {session?.username ? `, ${session.username}` : ""}.
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Here's where your sites, workforce and money stand right now.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {snapshot.map(({ label, icon: Icon, fig, to }, i) => (
              <Link
                key={label}
                to={to}
                aria-label={`${label}: ${fig.value}`}
                className={cn(
                  "group rounded-2xl border border-[#eef0f3] bg-[#fbfbf9] p-3.5 transition-colors",
                  "hover:border-[hsl(var(--accent)/0.35)] hover:bg-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
                  "ks-enter",
                )}
                style={{ ["--ks-delay" as string]: `${120 + i * 45}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-[hsl(var(--accent))]" />
                </div>
                <div className="mt-1.5 text-[22px] font-bold tabular-nums leading-none text-foreground" aria-busy={fig.loading || undefined}>
                  {fig.value}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard/employer/attendance"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_hsl(var(--accent)/0.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              <CalendarCheck className="h-4 w-4" /> Mark today's attendance
            </Link>
            <Link
              to="/dashboard/employer/expense-tracker"
              className="inline-flex items-center gap-2 rounded-xl border border-[#eef0f3] bg-white px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-[#f7f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              <Receipt className="h-4 w-4" /> Record an expense
            </Link>
          </div>
        </BentoCard>

        {/* The one ambient card: the figure an employer checks first. */}
        <BentoCard span="third" index={1} ambient className="flex flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Available balance</p>
              <p className="mt-1.5 text-[30px] font-bold tabular-nums leading-none text-foreground" aria-busy={balance.loading || undefined}>
                {balance.value}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
              <Wallet className="h-[18px] w-[18px]" />
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
            <div>
              <dt className="text-muted-foreground">Received</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-emerald-700">{received.value}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Spent</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-rose-700">{spent.value}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dues</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-amber-700">{dues.value}</dd>
            </div>
          </dl>
        </BentoCard>

        <BentoCard span="third" index={2} className="flex flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Attendance today</p>
              <p className="mt-1.5 text-[30px] font-bold tabular-nums leading-none text-foreground">
                {attendanceReady ? (
                  <>
                    {presentCount}
                    <span className="text-[16px] font-semibold text-muted-foreground"> / {workers.length}</span>
                  </>
                ) : attendanceError ? (
                  UNAVAILABLE
                ) : (
                  "…"
                )}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-[18px] w-[18px]" />
            </span>
          </div>
          <div className="mt-4">
            <div
              className="h-2 overflow-hidden rounded-full bg-[#eef0f3]"
              role="progressbar"
              aria-label="Share of workers present today"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={attendanceReady ? attendancePct : undefined}
            >
              <div
                className="h-full rounded-full bg-[hsl(var(--accent))] transition-[width] duration-700 ease-out"
                style={{ width: `${attendanceReady ? attendancePct : 0}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {attendanceReady ? `${attendancePct}% marked present · ${rupees(wagesToday)} in wages` : "Loading today's records"}
            </p>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* ── Workspace modules (Angular's 8-card home grid) ─────────────── */}
      <FadeContent as="section" aria-labelledby="home-modules">
        <h3 id="home-modules" className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/80">
          Workspace
        </h3>
        <BentoGrid>
          {HOME_MODULES.map(({ to, label, description, icon: Icon, accent }, index) => (
            <BentoCard
              key={to}
              span="quarter"
              index={3 + index}
              lift
              className="relative overflow-hidden"
              style={{ ["--module-accent" as string]: accent }}
            >
              <Link
                to={to}
                aria-label={`${label} — ${description}`}
                className="group flex h-full flex-col justify-between p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent))]"
              >
                <span aria-hidden="true" className="absolute right-4 top-4 text-[11px] font-bold tabular-nums text-muted-foreground/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105"
                  style={{ background: "color-mix(in srgb, var(--module-accent) 12%, white)", color: "var(--module-accent)" }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-4 block">
                  <span className="block text-[15px] font-semibold text-foreground">{label}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{description}</span>
                </span>
                <span className="mt-4 flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: "var(--module-accent)" }}>
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </BentoCard>
          ))}
        </BentoGrid>
      </FadeContent>

      {/* ── Activity ──────────────────────────────────────────────────── */}
      <FadeContent>
        <BentoGrid>
        <BentoCard span="wide" index={11} className="p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Recent transactions</h3>
              <p className="text-xs text-muted-foreground">Latest entries in your expense ledger</p>
            </div>
            <Link
              to="/dashboard/employer/expense-tracker"
              className="text-[12.5px] font-semibold text-[hsl(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              View all
            </Link>
          </div>
          {transactionsQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading ledger…</p>
          ) : transactionsQuery.isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Ledger unavailable right now.</p>
          ) : recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-[#eef0f3]">
              {recentTransactions.map((t, i) => {
                const isIncome = t.type === "INCOME";
                return (
                  <AnimatedItem as="li" key={t.id} index={i} interactive className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
                      )}
                    >
                      {isIncome ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{t.categoryName}</p>
                      <p className="truncate text-[11.5px] text-muted-foreground">
                        {formatDate(t.transactionDate)}
                        {siteNameById.get(t.siteId) ? ` · ${siteNameById.get(t.siteId)}` : ""}
                        {t.partyName ? ` · ${t.partyName}` : ""}
                      </p>
                    </div>
                    <span className={cn("shrink-0 text-[13px] font-semibold tabular-nums", isIncome ? "text-emerald-700" : "text-rose-700")}>
                      {isIncome ? "+" : "−"}
                      {rupees(t.grossAmount ?? t.amount)}
                    </span>
                  </AnimatedItem>
                );
              })}
            </ul>
          )}
        </BentoCard>

        <BentoCard span="third" index={12} className="p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Your sites</h3>
              <p className="text-xs text-muted-foreground">Active work locations</p>
            </div>
            <Link
              to="/dashboard/employer/site-management"
              className="text-[12.5px] font-semibold text-[hsl(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              Manage
            </Link>
          </div>
          {sitesQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading sites…</p>
          ) : sitesQuery.isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sites unavailable right now.</p>
          ) : sites.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No sites yet.</p>
          ) : (
            <ul className="space-y-1">
              {sites.slice(0, 5).map((site, i) => (
                <AnimatedItem as="li" key={site.siteId} index={i} interactive className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{site.siteName}</p>
                    <p className="flex items-center gap-1 truncate text-[11.5px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{site.address || "No address on file"}</span>
                    </p>
                  </div>
                </AnimatedItem>
              ))}
              {sites.length > 5 && (
                <li className="px-2 pt-1 text-[11.5px] text-muted-foreground">+{sites.length - 5} more</li>
              )}
            </ul>
          )}
        </BentoCard>
        </BentoGrid>
      </FadeContent>
    </div>
  );
}
