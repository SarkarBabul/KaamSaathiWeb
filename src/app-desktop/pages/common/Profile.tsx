import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, LogOut, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { useAuth } from "@/app-desktop/auth/useAuth";

// Angular's profile.component.ts reads exactly three fields from
// TokenService — getUserName(), getPhoneNumber(), getRole() — with no API
// call of its own. This mirrors that: name/phone/role come straight from
// the authenticated session already held by AuthContext, nothing fetched
// or fabricated.
function initials(name: string | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatRole(role: string | undefined): string {
  if (!role) return "Not available";
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Employer";
    case "ENTERPRISE":
      return "Enterprise";
    case "SUPER_ADMIN":
      return "Super Admin";
    default:
      return role;
  }
}

export default function Profile() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  const name = session?.username || "Not available";
  const phone = session?.mobileNumber || "Not available";
  const roleLabel = formatRole(session?.role);

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Account" title="Profile" trailing={today} />

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#eef0f3] bg-white p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:flex-row sm:text-left">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
        >
          {initials(session?.username)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-foreground">{name}</h2>
          <span className="mt-1 inline-block rounded-full bg-[#e8f2ff] px-3 py-1 text-xs font-semibold text-foreground">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact information</h3>
        <dl className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <dt className="text-xs text-muted-foreground">Phone number</dt>
              <dd className="text-sm font-medium text-foreground">{phone}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <dt className="text-xs text-muted-foreground">Role</dt>
              <dd className="text-sm font-medium text-foreground">{roleLabel}</dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[#eef0f3] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h3>
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            disabled
            title="Not implemented in the live Angular app (no click handler)"
            className="w-full justify-start gap-3 px-3 text-foreground"
          >
            <Settings className="h-4 w-4" /> Account settings
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
