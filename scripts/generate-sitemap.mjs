#!/usr/bin/env node
/**
 * Build-time sitemap generator for KaamSaathi
 * Usage: node scripts/generate-sitemap.mjs
 * Integrate into build: "prebuild": "node scripts/generate-sitemap.mjs"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://kaamsaathi.app";
const TODAY = new Date().toISOString().split("T")[0];

// ------------------------------------------------------------------
// 1. Static routes
// ------------------------------------------------------------------
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "daily", lastmod: TODAY },
  { path: "/features", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/pricing", priority: "0.9", changefreq: "monthly", lastmod: TODAY },
  { path: "/faq", priority: "0.8", changefreq: "monthly", lastmod: TODAY },
  { path: "/blog", priority: "0.9", changefreq: "daily", lastmod: TODAY },
  { path: "/schedule-demo", priority: "0.9", changefreq: "monthly", lastmod: TODAY },
  { path: "/worker-attendance-app", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/labour-management-app", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/contractor-attendance-app", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/mazdoor-hajri-app", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/construction-site-management", priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { path: "/kamet", priority: "0.7", changefreq: "monthly", lastmod: TODAY },
  { path: "/kamet/about", priority: "0.6", changefreq: "monthly", lastmod: TODAY },
  { path: "/kamet/services", priority: "0.6", changefreq: "monthly", lastmod: TODAY },
  { path: "/kamet/contact", priority: "0.6", changefreq: "monthly", lastmod: TODAY },
];

// ------------------------------------------------------------------
// 2. Parse blogPosts.ts for dynamic blog routes
// ------------------------------------------------------------------
function parseBlogPosts() {
  const blogFile = path.join(__dirname, "..", "src", "data", "blogPosts.ts");
  if (!fs.existsSync(blogFile)) {
    console.warn("⚠️  blogPosts.ts not found — skipping blog entries");
    return [];
  }
  const content = fs.readFileSync(blogFile, "utf-8");
  const posts = [];

  // Extract each blog post object — match from { slug: ... } blocks
  // We use a regex that captures slug, date, and language per post block
  const postBlockRegex = /\{\s*slug:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?language:\s*"([^"]+)"[\s\S]*?\}(?:,|\s*\])/g;
  let match;
  while ((match = postBlockRegex.exec(content)) !== null) {
    posts.push({
      slug: match[1],
      date: match[2],
      language: match[3],
    });
  }

  return posts;
}

// ------------------------------------------------------------------
// 3. Generate XML sitemap
// ------------------------------------------------------------------
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrlElement({ loc, lastmod, changefreq, priority, alternates = [] }) {
  let xml = "  <url>\n";
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) xml += `    <priority>${priority}</priority>\n`;

  for (const alt of alternates) {
    xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${escapeXml(alt.url)}"/>\n`;
  }

  xml += "  </url>\n";
  return xml;
}

function generateSitemap() {
  const blogPosts = parseBlogPosts();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Static routes
  for (const route of staticRoutes) {
    const alternates = [];
    if (route.path === "/") {
      alternates.push(
        { lang: "en", url: `${SITE_URL}/` },
        { lang: "hi", url: `${SITE_URL}/` },
        { lang: "x-default", url: `${SITE_URL}/` }
      );
    }
    xml += buildUrlElement({
      loc: `${SITE_URL}${route.path}`,
      lastmod: route.lastmod,
      changefreq: route.changefreq,
      priority: route.priority,
      alternates,
    });
  }

  // Blog posts
  for (const post of blogPosts) {
    const langMap = { en: "en", hi: "hi", hinglish: "en" };
    const hreflang = langMap[post.language] || "en";
    const alternates = [
      { lang: hreflang, url: `${SITE_URL}/blog/${post.slug}` },
      { lang: "x-default", url: `${SITE_URL}/blog/${post.slug}` },
    ];

    xml += buildUrlElement({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: "0.7",
      alternates,
    });
  }

  xml += "</urlset>\n";
  return xml;
}

// ------------------------------------------------------------------
// 4. Write files
// ------------------------------------------------------------------
function main() {
  const sitemapXml = generateSitemap();
  const publicDir = path.join(__dirname, "..", "public");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemapXml, "utf-8");
  console.log(`✅ sitemap.xml generated (${staticRoutes.length} static + dynamic blog URLs)`);

  // Update robots.txt with sitemap reference
  const robotsPath = path.join(publicDir, "robots.txt");
  let robotsContent = fs.existsSync(robotsPath)
    ? fs.readFileSync(robotsPath, "utf-8")
    : "User-agent: *\nAllow: /\n";

  // Remove any existing Sitemap line to avoid duplicates
  robotsContent = robotsContent.replace(/Sitemap:\s*.+\n?/gi, "");
  // Ensure file ends with newline
  if (!robotsContent.endsWith("\n")) robotsContent += "\n";
  robotsContent += `Sitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(robotsPath, robotsContent, "utf-8");
  console.log("✅ robots.txt updated with Sitemap reference");
}

main();
