import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { seoPages } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: ChangeFrequency, lastModified = now) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority
  });

  return [
    entry("/", 1, "weekly"),
    entry("/pricing", 0.7, "monthly"),
    entry("/blog", 0.8, "weekly"),
    entry("/about", 0.5, "yearly"),
    entry("/contact", 0.4, "yearly"),
    entry("/refund-policy", 0.4, "yearly"),
    entry("/digital-delivery-policy", 0.4, "yearly"),
    ...seoPages.map((page) => entry(page.slug, page.group === "tool" ? 0.8 : 0.7, "monthly")),
    ...blogPosts.map((post) => entry(post.slug, post.priority, "monthly", new Date(post.updatedAt))),
    entry("/privacy-policy", 0.3, "yearly"),
    entry("/terms", 0.3, "yearly")
  ];
}
