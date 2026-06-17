import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Privacy Policy | JobResumeMatch", description: "Privacy-first policy for JobResumeMatch resume analysis and private result URLs.", path: "/privacy-policy" });

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs current="Privacy Policy" />
      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-black text-slate-950">Privacy Policy</h1>
        <div className="mt-6 space-y-5 leading-8 text-slate-700">
          <p>JobResumeMatch provides AI-assisted resume suggestions. Resumes may contain personal data, so the MVP is designed with private token result URLs and noindex result pages.</p>
          <p>We do not sell your resume data. Free analyses may expire automatically. Resume text is used to generate the requested analysis and should not be treated as permanently stored unless a future save feature clearly asks for permission.</p>
          <p>Third-party AI providers may process submitted content when an API key is configured. Users are responsible for reviewing outputs before using them in applications.</p>
        </div>
      </main>
    </>
  );
}
