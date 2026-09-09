import type { Session } from "@/app-desktop/types/auth";

// Namespaced under one key so logout never touches unrelated localStorage
// data on this origin (the Angular app it replaces used a blanket
// localStorage.clear(), which this deliberately does not reproduce).
const SESSION_KEY = "ks_desktop_session";

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
