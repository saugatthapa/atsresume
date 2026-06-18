import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";

export function GET() {
  const urls = sitemap()
    .filter((item) => !item.url.includes("/blog/"))
    .map((item) => `<url><loc>${item.url}</loc><lastmod>${new Date(item.lastModified || new Date()).toISOString()}</lastmod><changefreq>${item.changeFrequency ?? "monthly"}</changefreq><priority>${item.priority}</priority></url>`)
    .join("");
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml" }
  });
}
