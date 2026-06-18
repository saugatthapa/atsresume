import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";
import { appJsonLd, createMetadata, organizationJsonLd, productJsonLd, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "JobResumeMatch - Free ATS Resume Checker for Job Descriptions",
    description: "Match your resume to any job description with a free ATS resume checker. Get a resume match score, missing keywords, bullet suggestions, and clean PDF/DOCX exports.",
    path: "/"
  }),
  metadataBase: new URL(siteUrl)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-22946BK7PC" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-22946BK7PC');
          `}
        </Script>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={appJsonLd()} />
        <JsonLd data={productJsonLd()} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
