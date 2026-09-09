import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app-desktop/auth/useAuth";

// Equivalent of Angular's AuthGuard, fixed: the Angular version accepted a
// `roles` array in route data but only ever read a singular `role` key, so
// role enforcement silently never happened at this layer. Role checks now
// belong entirely to RoleRoute, and this guard only ever asserts "logged in".
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
