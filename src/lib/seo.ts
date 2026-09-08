export const SITE_URL = "https://kaamsaathi.app";
export const CANONICAL_HOST = "kaamsaathi.app";

export function normalizeCanonicalPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";

  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

export function canonicalUrlForPath(pathname: string): string {
  const path = normalizeCanonicalPath(pathname);
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}