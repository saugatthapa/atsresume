"use client";

import { FileText, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function ResumeJobForm() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      router.push(`/result/${data.token}`);
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
        <p className="mt-3 text-base leading-7 text-[#64748b]">Paste your resume and the job description. Upload PDF or DOCX if that is faster.</p>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-5">
          <label htmlFor="resume" className="flex items-center gap-2 text-lg font-extrabold text-[#0b1220]">
            <FileText aria-hidden="true" size={20} className="text-[#2563eb]" />
            Resume text
          </label>
          <textarea
            id="resume"
            className="focus-ring mt-4 min-h-[112px] w-full resize-y rounded-2xl border border-[#dde7f5] bg-white p-4 leading-6 text-[#0b1220] placeholder:text-[#94a3b8]"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
          />
          <label className="mt-3 block">
            <span className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
              <UploadCloud aria-hidden="true" size={16} />
              Or upload PDF/DOCX/TXT
            </span>
            <input
              className="focus-ring mt-2 block w-full rounded-2xl border border-dashed border-[#bfd1ea] bg-white p-4 text-sm text-[#64748b]"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
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
          {loading ? "Analyzing..." : "Generate ATS Match Score"}
        </button>
        <p className="flex items-center gap-2 text-sm font-semibold text-[#64748b]" aria-live="polite">
          <LockKeyhole aria-hidden="true" size={16} />
          Privacy-first: no signup required, private noindex result URLs, and we do not sell your resume data.
        </p>
      </div>
    </section>
  );
}
