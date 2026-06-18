import { SeoLandingPage } from "@/components/SeoLandingPage";
import { blogPages } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

const page = blogPages.find((item) => item.slug === "/blog/ats-resume-checker-vs-resume-parser")!;

export const metadata = createMetadata({ title: page.title, description: page.description, path: page.slug });

export default function Page() {
  return <SeoLandingPage page={page} />;
}
