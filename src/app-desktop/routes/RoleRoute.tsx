import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { getRedirectRoute } from "@/app-desktop/auth/AuthContext";

interface RoleRouteProps {
  allow: string[];
}

// Equivalent of Angular's RoleGuard, fixed: the Angular version lowercased
// userRole before a switch that still matched on the literal 'ENTERPRISE',
// so that branch could never fire and enterprise users failing a role check
// elsewhere were misrouted to /dashboard/user/home. Comparison here is
// case-insensitive end-to-end via getRedirectRoute.
export function RoleRoute({ allow }: RoleRouteProps) {
  const { session } = useAuth();
  const userRole = session?.role?.toLowerCase();
  const allowedRoles = allow.map((role) => role.toLowerCase());

  if (userRole && allowedRoles.includes(userRole)) {
    return <Outlet />;
  }

  return <Navigate to={getRedirectRoute(session?.role ?? "")} replace />;
}
