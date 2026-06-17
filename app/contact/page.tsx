import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Contact | JobResumeMatch", description: "Contact JobResumeMatch for support, privacy requests, and product feedback.", path: "/contact" });

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs current="Contact" />
      <main className="container max-w-3xl py-12">
        <h1 className="text-4xl font-black text-slate-950">Contact</h1>
        <p className="mt-5 leading-8 text-slate-700">
          For support, privacy requests, or product feedback, contact the JobResumeMatch team at <a className="font-bold text-blue-700" href="mailto:support@jobresumematch.com">support@jobresumematch.com</a>.
        </p>
      </main>
    </>
  );
}
