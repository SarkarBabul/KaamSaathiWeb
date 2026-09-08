const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export interface Blog {
  id: number;
  documentId: string;
  Title: string;
  Slug: string | null;
  Description: string;
  Content: string;
  Author: string | null;
  Category: string | null;
  Tags: string[] | null;
  publishedAt: string;
  Cover: {
    id: number;
    url: string;
    alternativeText: string;
  } | null;
}

export function getCoverUrl(blog: Blog): string {
  const url = blog.Cover?.url;
  if (!url) return "/placeholder-blog.png";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

export function getStrapiUrl(): string {
  return STRAPI_URL;
}

export async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/blogs?populate=*&sort=publishedAt:desc`,
  );
  if (!res.ok) throw new Error("Failed to fetch blogs");
  const json = await res.json();
  return json.data;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const res = await fetch(
    `${STRAPI_URL}/api/blogs?filters[Slug][$eq]=${slug}&populate=*`,
  );
  if (!res.ok) throw new Error("Failed to fetch blog");
  const json = await res.json();
  return json.data[0] ?? null;
}