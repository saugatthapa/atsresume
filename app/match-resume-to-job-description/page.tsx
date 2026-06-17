import { SeoLandingPage } from "@/components/SeoLandingPage";
import { seoPages } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
const page = seoPages.find((item) => item.slug === "/match-resume-to-job-description")!;
export const metadata = createMetadata({ title: page.title, description: page.description, path: page.slug });
export default function Page() { return <SeoLandingPage page={page} />; }
