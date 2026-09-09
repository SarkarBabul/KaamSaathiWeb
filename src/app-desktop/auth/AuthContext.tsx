import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { clearSession, readSession, writeSession } from "@/app-desktop/auth/authStorage";
import { registerUnauthorizedHandler } from "@/app-desktop/api/httpClient";
import type { LoginResponse, Session, UserRole } from "@/app-desktop/types/auth";

// Fixed vs. the Angular source: getRedirectRoute is now the single place
// that decides post-login destination, and every login mode (password, OTP)
// routes through it — the Angular app's OTP path bypassed this with a
// hardcoded admin/non-admin branch, which misrouted ENTERPRISE/super_admin
// users logging in via OTP.
export function getRedirectRoute(role: UserRole): string {
  switch (role.toUpperCase()) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    case "ADMIN":
      return "/dashboard/employer/home";
    case "ENTERPRISE":
      return "/enterprise/dashboard";
    default:
      return "/dashboard/user/home";
  }
}

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => Session;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const login = useCallback((response: LoginResponse): Session => {
    const next: Session = {
      accessToken: response.accessToken,
      role: response.role,
      userId: response.id,
      parentId: response.id,
      username: response.username,
      mobileNumber: response.mobileNumber,
      planId: response.planId ?? null,
    };
    writeSession(next);
    setSession(next);
    return next;
  }, []);

  // A 401 from any API call forces logout — the Angular app never wired
  // this despite having a token that could expire server-side.
  useMemo(() => {
    registerUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
