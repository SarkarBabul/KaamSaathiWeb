/**
 * Central route registry for SEO and sitemap generation.
 * Keep this file free of image imports — pure metadata only.
 */

export const SITE_URL = "https://kaamsaathi.app";

export interface SiteRoute {
  path: string;
  priority: number;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string;
  alternateLangs?: { lang: string; url: string }[];
}

/**
 * Static marketing / core pages
 */
export const staticRoutes: SiteRoute[] = [
  { path: "/", priority: 1.0, changefreq: "daily", lastmod: "2025-05-13" },
  { path: "/features", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
  { path: "/pricing", priority: 0.9, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/faq", priority: 0.8, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/blog", priority: 0.9, changefreq: "daily", lastmod: "2025-05-13" },
  { path: "/schedule-demo", priority: 0.9, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/cost-estimation/brick-estimation", priority: 0.7, changefreq: "monthly", lastmod: "2026-06-04" },
];

/**
 * SEO landing pages (keyword-targeted)
 */
export const seoLandingRoutes: SiteRoute[] = [
  { path: "/worker-attendance-app", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
  { path: "/labour-management-app", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
  { path: "/contractor-attendance-app", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
  { path: "/mazdoor-hajri-app", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
  { path: "/construction-site-management", priority: 0.9, changefreq: "weekly", lastmod: "2025-05-13" },
];

/**
 * Kamet corporate pages (nested under /kamet)
 */
export const kametRoutes: SiteRoute[] = [
  { path: "/kamet", priority: 0.7, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/kamet/about", priority: 0.6, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/kamet/services", priority: 0.6, changefreq: "monthly", lastmod: "2025-05-13" },
  { path: "/kamet/contact", priority: 0.6, changefreq: "monthly", lastmod: "2025-05-13" },
];

/**
 * All KaamSaathi public routes (static + SEO landing)
 * Excludes blog posts — those are injected dynamically from blogPosts.ts
 */
export const allStaticRoutes: SiteRoute[] = [
  ...staticRoutes,
  ...seoLandingRoutes,
  ...kametRoutes,
];