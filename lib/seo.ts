import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://jobresumematch.com";
export const siteName = "JobResumeMatch";

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createMetadata({
  title,
  description,
  path,
  noIndex = false
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(path),
      siteName,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "JobResumeMatch ATS resume checker" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"]
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl("/og-image.png")
  };
}

export function appJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: siteName,
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "ATS resume checker for matching resumes to job descriptions.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free resume preview" },
      { "@type": "Offer", price: "4.99", priceCurrency: "EUR", description: "Resume Export Pass for clean PDF, editable DOCX, and full ATS report" }
    ]
  };
}

export function productJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "JobResumeMatch Resume Export Pass",
    description: "One-time export pass for a specific resume and job description, including clean PDF, editable DOCX, and full ATS match report.",
    brand: {
      "@type": "Brand",
      name: siteName
    },
    offers: {
      "@type": "Offer",
      price: "4.99",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing")
    }
  };
}
