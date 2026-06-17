import type { MetadataRoute } from "next";
import { allPublicPages } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/privacy-policy`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/contact`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/blog`, lastModified: now, priority: 0.7 },
    ...allPublicPages.map((page) => ({
      url: `${siteUrl}${page.slug}`,
      lastModified: now,
      priority: page.priority
    }))
  ];
}
