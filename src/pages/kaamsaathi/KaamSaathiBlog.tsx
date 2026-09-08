import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getBlogs, getCoverUrl, type Blog } from "@/lib/strapi";

const SITE_URL = "https://kaamsaathi.app";

const BLOG_CATEGORIES = [
  "Labour Management",
  "Contractor Tips",
  "Construction Site Management",
  "Worker Attendance",
  "Daily Wage Management",
  "Construction Technology",
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function KaamSaathiBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    getBlogs()
      .then(setBlogs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => activeCat === "All" ? blogs : blogs.filter(b => b.Category === activeCat),
    [activeCat, blogs],
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: blogs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${b.Slug}`,
      name: b.Title,
    })),
  };

  return (
    <div>
      <Helmet>
        <title>KaamSaathi Blog — Labour Management, Contractor Tips & Construction Tech</title>
        <meta name="description" content="KaamSaathi blog: Hindi & English articles on labour management, contractor tips, worker attendance, daily wage payments and construction technology in India." />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #c47d2b 0%, #a85e14 100%)",
        padding: "140px 24px 60px",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: -0.5 }}>
            KaamSaathi Blogs
          </h1>
          <div style={{ height: 16 }} />
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.88)", lineHeight: 1.7 }}>
            Tips, guides और updates हिंदी और English में।
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{
        background: "#fff",
        borderBottom: "1.5px solid #f0ece8",
        position: "sticky",
        top: 92,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {["All", ...BLOG_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                flexShrink: 0,
                padding: "12px 18px",
                fontSize: 13.5,
                fontWeight: activeCat === cat ? 700 : 500,
                color: activeCat === cat ? "#c47d2b" : "#555",
                background: "none",
                border: "none",
                borderBottom: activeCat === cat ? "2.5px solid #c47d2b" : "2.5px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading && <p style={{ textAlign: "center", padding: 60, fontSize: 16, color: "#666" }}>Loading blogs...</p>}
        {error && <p style={{ textAlign: "center", padding: 60, fontSize: 16, color: "#e53e3e" }}>Failed to load blogs. Please try again later.</p>}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ textAlign: "center", padding: 60, fontSize: 16, color: "#666" }}>No blogs in this category yet.</p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 28,
          }}>
            {filtered.map(blog => (
              <Link
                key={blog.id}
                to={`/blog/${blog.Slug}`}
                style={{ textDecoration: "none" }}
                className="blog-card-link"
              >
                <BlogCard blog={blog} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: hovered ? "0 10px 28px rgba(0,0,0,0.11)" : "0 2px 12px rgba(0,0,0,0.07)",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        background: "#fff",
        border: "1.5px solid #f0ece8",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Cover */}
      <div style={{ width: "100%", height: 210, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={getCoverUrl(blog)}
          alt={blog.Title}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {blog.Category && (
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.05em", color: "#c47d2b", background: "#fdf6ee",
              border: "1px solid #f0e0c8", padding: "3px 10px", borderRadius: 20,
            }}>
              {blog.Category}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#aaa" }}>
            {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <h2 style={{
          fontSize: 17, fontWeight: 700,
          color: hovered ? "#c47d2b" : "#1a1a1a",
          lineHeight: 1.4, transition: "color 0.15s", margin: 0,
        }}>
          {blog.Title}
        </h2>

        <p style={{
          fontSize: 13.5, color: "#666", lineHeight: 1.65, flex: 1, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {blog.Description}
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 4, paddingTop: 12, borderTop: "1px solid #f5f0eb",
        }}>
          {blog.Author
            ? <span style={{ fontSize: 12.5, color: "#999" }}>By {blog.Author}</span>
            : <span />
          }
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c47d2b" }}>Read more →</span>
        </div>
      </div>
    </div>
  );
}