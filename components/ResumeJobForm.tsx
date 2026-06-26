"use client";

import { CheckCircle2, FileCheck2, FileText, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const sampleResume = `Rohan Sharma
Frontend Developer
Pokhara, Nepal | rohan.sharma@example.com | github.com/rohansharma | linkedin.com/in/rohansharma

Professional Summary
Frontend developer with 3 years of experience building responsive SaaS interfaces using React, Next.js, TypeScript, Tailwind CSS, and REST APIs. Experienced in improving page speed, debugging UI issues, collaborating with designers, and shipping accessible components for business users.

Skills
React, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML, CSS, REST APIs, Git, GitHub, Vercel, SEO, responsive design, UI components, debugging, Core Web Vitals

Experience
Frontend Developer, BrightDash SaaS
- Built reusable React and TypeScript dashboard components used across customer reporting pages.
- Integrated REST API data into Next.js pages and improved loading states for account managers.
- Improved responsive layouts for mobile and tablet users, reducing UI support tickets.
- Collaborated with product and design teams to ship accessible forms, filters, and navigation patterns.

Projects
Portfolio analytics dashboard using Next.js, Tailwind CSS, GitHub, and Vercel.
SEO landing page templates with responsive design and reusable UI sections.`;

const sampleJobDescription = `Frontend Developer - SaaS Platform

We are looking for a Frontend Developer to build polished SaaS product experiences using React, Next.js, TypeScript, and Tailwind CSS. The role requires strong UI implementation skills, REST API integration, responsive design, accessibility, and attention to Core Web Vitals.

Responsibilities include building reusable components, improving dashboard performance, connecting frontend pages to backend APIs, collaborating with product and design, writing maintainable TypeScript, and testing user flows. Experience with Prisma, PostgreSQL, Vercel, GitHub workflows, SEO-friendly pages, and modern frontend testing is a plus.`;

export function ResumeJobForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function fillSample() {
    if ((resumeText.trim() || jobDescription.trim()) && !window.confirm("Replace the current resume and job description text with sample data?")) {
      return;
    }
    setResumeText(sampleResume);
    setJobDescription(sampleJobDescription);
    setError("");
  }

  async function submit() {
    setError("");
    if (!file && resumeText.trim().length < 300) {
      setError("Paste at least 300 characters of resume text, or upload a readable resume file.");
      return;
    }
    if (jobDescription.trim().length < 200) {
      setError("Paste at least 200 characters from the job description.");
      return;
    }
    setLoading(true);
    try {
      trackEvent("resume_check_started", { hasFile: Boolean(file), hasPastedResume: resumeText.trim().length > 0 });
      const form = new FormData();
      form.set("resumeText", resumeText);
      form.set("jobDescription", jobDescription);
      if (file) form.set("resumeFile", file);

      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      trackEvent("resume_check_completed");
      router.push(data.redirectUrl || `/result/${data.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="checker" className="scroll-mt-28 rounded-[28px] border border-[#dde7f5] bg-white p-5 shadow-[0_18px_44px_-24px_rgba(8,20,51,0.16)] md:p-10">
      <div className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-[#2563eb]">
          <Sparkles aria-hidden="true" size={16} />
          Instant resume-to-job analysis
        </div>
        <h2 className="text-3xl font-black tracking-tight text-[#0b1220] md:text-4xl">Get your ATS match score</h2>
        <p className="mt-3 text-base leading-7 text-[#64748b]">Add one resume and one job description. For the resume, paste text or upload a file.</p>
        <button type="button" className="focus-ring mt-4 inline-flex min-h-[42px] items-center rounded-xl border border-[#bfd1ea] bg-white px-4 text-sm font-extrabold text-[#2563eb] hover:bg-blue-50" onClick={fillSample}>
          Try Sample Resume
        </button>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-sm font-extrabold text-[#0f172a] sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" size={18} className="shrink-0 text-[#2563eb]" />
          <span>1. Resume: paste text or upload a file</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" size={18} className="shrink-0 text-[#2563eb]" />
          <span>2. Job description: paste the role text</span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-5">
          <label htmlFor="resume" className="flex items-center gap-2 text-lg font-extrabold text-[#0b1220]">
            <FileText aria-hidden="true" size={20} className="text-[#2563eb]" />
            Resume
          </label>
          <p className="mt-1 text-sm font-semibold text-[#64748b]">Paste your resume text below, or upload a resume file instead.</p>
          <textarea
            id="resume"
            className="focus-ring mt-4 min-h-[112px] w-full resize-y rounded-2xl border border-[#dde7f5] bg-white p-4 leading-6 text-[#0b1220] placeholder:text-[#94a3b8]"
            placeholder="Paste resume text here..."
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
          />
          <div className="my-4 flex items-center gap-3 text-xs font-black uppercase tracking-wide text-[#64748b]">
            <span className="h-px flex-1 bg-[#dbe4f0]" />
            <span>or upload instead</span>
            <span className="h-px flex-1 bg-[#dbe4f0]" />
          </div>
          <div className="rounded-2xl border border-dashed border-[#bfd1ea] bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-[#0b1220]">
                  <UploadCloud aria-hidden="true" size={17} className="text-[#2563eb]" />
                  Upload resume file instead
                </p>
                <p className="mt-1 text-xs font-semibold text-[#64748b]">PDF, DOCX, or TXT accepted. You only need one resume input.</p>
              </div>
              <button type="button" className="primary-button focus-ring inline-flex min-h-[42px] items-center justify-center rounded-xl px-4 text-sm font-extrabold shadow-sm" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </button>
            </div>
            <input
              id="resume-file"
              ref={fileInputRef}
              className="sr-only"
              type="file"
              aria-label="Upload resume file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-[#2563eb]">
                <FileCheck2 aria-hidden="true" size={15} />
                <span className="truncate">Selected file: {file.name}</span>
              </p>
            )}
          </div>
        </div>
        <div className="rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-5">
          <label htmlFor="job" className="flex items-center gap-2 text-lg font-extrabold text-[#0b1220]">
            <FileText aria-hidden="true" size={20} className="text-[#2563eb]" />
            Job description
          </label>
          <textarea
            id="job"
            className="focus-ring mt-4 min-h-[190px] w-full resize-y rounded-2xl border border-[#dde7f5] bg-white p-4 leading-6 text-[#0b1220] placeholder:text-[#94a3b8]"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800" aria-live="polite">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <button
          className="primary-button focus-ring min-h-[54px] rounded-xl px-7 py-4 font-extrabold shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Get My ATS Match Score"}
        </button>
        <p className="flex items-center gap-2 text-sm font-semibold text-[#64748b]" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={16} />
          Privacy-first: no signup required, private result links, and we do not sell your resume data.
        </p>
      </div>
    </section>
  );
}
