import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogBySlug, type Blog } from "@/lib/strapi";
import { BlogArticleLayout } from "@/components/kaamsaathi/BlogArticleLayout";

export default function KaamSaathiBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { navigate("/blog", { replace: true }); return; }

    getBlogBySlug(slug)
      .then((data) => {
        if (!data) { navigate("/blog", { replace: true }); return; }
        setBlog(data);
      })
      .catch(() => navigate("/blog", { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  if (!blog) return null;

  return <BlogArticleLayout blog={blog} />;
}