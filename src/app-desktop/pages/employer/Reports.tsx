import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, IndianRupee } from "lucide-react";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";

// Mirrors reports.component.html exactly: a two-card landing page linking
// to the attendance and payment sub-reports — no data of its own.
const REPORT_CARDS = [
  {
    to: "/dashboard/employer/reports/attendance",
    title: "Attendance Report",
    description: "Daily and monthly attendance details",
    icon: CalendarDays,
    tint: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    to: "/dashboard/employer/reports/payment",
    title: "Payment Report",
    description: "Salary and pending payments",
    icon: IndianRupee,
    tint: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employer" title="Reports Dashboard" trailing="View and analyze various reports" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORT_CARDS.map(({ to, title, description, icon: Icon, tint, iconColor }, i) => (
          <GlowCard key={to} index={i} lift bare className="rounded-2xl border border-[#eef0f3] bg-white">
            <Link
              to={to}
              className="group flex h-full flex-col justify-between p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2ba85b]"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
                </div>
              </div>
              <span className="mt-4 flex items-center gap-1 text-[12.5px] font-semibold text-[#1c7a3d]">
                View report
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
