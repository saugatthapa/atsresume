import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";
import { appJsonLd, createMetadata, organizationJsonLd, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Job Resume Match - Free ATS Resume Checker for Job Descriptions",
    description: "Check how well your resume matches any job description. Get an instant ATS match score, missing keywords, matched skills, and resume improvement suggestions.",
    path: "/"
  }),
  metadataBase: new URL(siteUrl)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={appJsonLd()} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
