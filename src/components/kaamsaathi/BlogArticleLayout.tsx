import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Blog, getCoverUrl } from "@/lib/strapi";
import "./BlogArticleLayout.scss";

const SITE_URL = "https://kaamsaathi.app";

interface TocItem { id: string; text: string; level: number; }
interface Props { blog: Blog; }

export function BlogArticleLayout({ blog }: Props) {
  const navigate = useNavigate();
  const url = `${SITE_URL}/blog/${blog.Slug}`;
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      const headings = contentRef.current.querySelectorAll("h1, h2, h3");
      if (!headings.length) return;

      const items: TocItem[] = [];
      headings.forEach((el, i) => {
        const id = `toc-${i}`;
        el.id = id;
        items.push({
          id,
          text: el.textContent?.trim() || "",
          level: el.tagName === "H1" ? 1 : el.tagName === "H2" ? 2 : 3,
        });
      });
      setTocItems(items);

      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        entries => {
          const visible = entries.filter(e => e.isIntersecting);
          if (visible.length) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
      );
      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observerRef.current!.observe(el);
      });
    }, 150);

    return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
  }, [blog]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 110,
      behavior: "smooth",
    });
  };

  const articleSchema = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: blog.Title, description: blog.Description,
    image: getCoverUrl(blog), articleSection: blog.Category,
    datePublished: blog.publishedAt, dateModified: blog.publishedAt,
    author: { "@type": "Organization", name: "KaamSaathi", url: SITE_URL },
    publisher: { "@type": "Organization", name: "KaamSaathi", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: blog.Title, item: url },
    ],
  };

  return (
    <div className="blog-page-wrapper">
      <Helmet>
        <title>{blog.Title}</title>
        <meta name="description" content={blog.Description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.Title} />
        <meta property="og:description" content={blog.Description} />
        <meta property="og:image" content={getCoverUrl(blog)} />
        <meta property="og:site_name" content="KaamSaathi" />
        <meta property="article:published_time" content={blog.publishedAt} />
        {blog.Category && <meta property="article:section" content={blog.Category} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.Title} />
        <meta name="twitter:description" content={blog.Description} />
        <meta name="twitter:image" content={getCoverUrl(blog)} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero — gradient background with back link, category, title, date */}
      <section className="blog-hero-section">
        <div className="blog-hero-section__inner">
          <button className="blog-hero-section__back" onClick={() => navigate("/blog")}>
            ← Back to Blog
          </button>
          {blog.Category && (
            <span className="blog-hero-section__category">{blog.Category}</span>
          )}
          <h1 className="blog-hero-section__title">{blog.Title}</h1>
          <div className="blog-hero-section__meta">
            <span>
              {new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            {blog.Author && <span>By {blog.Author}</span>}
          </div>
        </div>
      </section>

      {/* Cover image — pulled up to overlap hero */}
      <div className="blog-cover-hero">
        <img src={getCoverUrl(blog)} alt={blog.Title} />
      </div>

      {/* Content section */}
      <section className="blog-detail-section">
        <div className="blog-detail-layout">

          {/* Article */}
          <article className="blog-detail">
            {blog.Description && (
              <p className="blog-detail__excerpt">{blog.Description}</p>
            )}
            <div ref={contentRef} className="blog-detail__content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {blog.Content}
              </ReactMarkdown>
            </div>
          </article>

          {/* TOC Sidebar */}
          {tocItems.length > 0 && (
            <aside className="blog-toc">
              <div className="blog-toc__inner">
                <div className="blog-toc__header">
                  <span className="blog-toc__icon">≡</span> On this page
                </div>
                <nav>
                  <ul className="blog-toc__list">
                    {tocItems.map(item => (
                      <li
                        key={item.id}
                        className={[
                          "blog-toc__item",
                          item.level === 3 ? "blog-toc__item--h3" : "",
                          activeId === item.id ? "blog-toc__item--active" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => scrollTo(item.id)}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

        </div>
      </section>
    </div>
  );
}