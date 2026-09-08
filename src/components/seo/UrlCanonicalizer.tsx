import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CANONICAL_HOST, normalizeCanonicalPath } from "@/lib/seo";

export function UrlCanonicalizer() {
  const location = useLocation();

  useEffect(() => {
    const { protocol, hostname, pathname, search, hash } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    const isKaamSaathiDomain = hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`;
    const nextProtocol = isKaamSaathiDomain && !isLocalhost ? "https:" : protocol;
    const nextHostname = hostname === `www.${CANONICAL_HOST}` ? CANONICAL_HOST : hostname;
    const nextPathname = normalizeCanonicalPath(pathname);

    if (protocol !== nextProtocol || hostname !== nextHostname || pathname !== nextPathname) {
      window.location.replace(`${nextProtocol}//${nextHostname}${nextPathname}${search}${hash}`);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}