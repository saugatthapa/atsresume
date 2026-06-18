import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About JobResumeMatch | ATS Resume Checker",
  description:
    "Learn about JobResumeMatch, a resume matching tool that helps job seekers compare resumes with job descriptions, find missing keywords, and export cleaner resume files.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs current="About" />
      <main className="container max-w-4xl py-12">
        <p className="inline-flex rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-sm">
          Resume matching guidance
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">About JobResumeMatch</h1>
        <div className="mt-6 space-y-5 text-lg leading-8 text-[#53657d]">
          <p>
            JobResumeMatch helps job seekers compare their resume with a specific job description before applying. The tool provides an estimated ATS resume match score, missing keywords, matched skills, bullet improvement suggestions, and a limited optimized resume preview.
          </p>
          <p>
            Users can check their resume for free. When the result is worth keeping, they can purchase the Resume Export Pass to unlock the full optimized resume, clean PDF, editable DOCX, and full ATS match report.
          </p>
        </div>
        <div className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Important disclaimer</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            JobResumeMatch provides educational resume guidance and estimated match scoring. It does not guarantee interviews, job offers, or ATS approval.
          </p>
        </div>
        <Link href="/#checker" className="primary-button focus-ring mt-8 inline-flex min-h-[52px] items-center rounded-xl px-6 font-extrabold shadow-sm">
          Check My Resume Free
        </Link>
      </main>
    </>
  );
}
