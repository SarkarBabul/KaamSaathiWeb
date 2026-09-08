import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { canonicalUrlForPath } from "@/lib/seo";

export function CanonicalHead() {
  const location = useLocation();
  const canonicalUrl = canonicalUrlForPath(location.pathname);

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
}