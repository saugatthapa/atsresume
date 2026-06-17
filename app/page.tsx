import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { ClipboardPaste, Download, FileCheck2, Gauge, LockKeyhole, ScanSearch, SearchCheck, ShieldCheck, Sparkles, Stamp, Upload, WandSparkles } from "lucide-react";
import { ActiveUsersBadge } from "@/components/ActiveUsersBadge";
import { PricingCards } from "@/components/PricingCards";
import { ResumeJobForm } from "@/components/ResumeJobForm";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Job Resume Match - Free ATS Resume Checker for Job Descriptions",
  description: "Check how well your resume matches any job description. Get an instant ATS match score, missing keywords, matched skills, and resume improvement suggestions.",
  path: "/"
});

const faqs = [
  { question: "Is JobResumeMatch really free?", answer: "Yes. You can run a free analysis and download a useful watermarked preview. Clean exports are unlocked with a one-time payment." },
  { question: "Will this guarantee an interview?", answer: "No. The score is an estimate for guidance. Employers use different ATS systems, recruiter review processes, and hiring criteria." },
  { question: "What does the watermark mean?", answer: "Free exports include a light watermark and footer so the preview is useful but not a polished employer-ready document." },
  { question: "Can I remove the watermark instantly?", answer: "Yes. The MVP includes a mock unlock flow that changes the current report to clean export state immediately." },
  { question: "Is my resume private?", answer: "Result pages use private token URLs and are marked noindex so search engines should not index them." }
];

type IconCard = { number?: string; title: string; copy: string; Icon: LucideIcon };

const steps: IconCard[] = [
  { number: "01", title: "Upload resume", copy: "Paste text or upload a PDF/DOCX resume.", Icon: Upload },
  { number: "02", title: "Paste job description", copy: "Use the exact role you plan to apply for.", Icon: ClipboardPaste },
  { number: "03", title: "Get score and fixes", copy: "See keyword gaps, matched skills, and weak bullets.", Icon: Sparkles },
  { number: "04", title: "Download optimized version", copy: "Export a watermarked preview or unlock clean PDF.", Icon: Download }
];

const features: IconCard[] = [
  { title: "ATS Match Score", copy: "Get an estimated score that explains the fit, not just a number.", Icon: Gauge },
  { title: "Missing Keywords", copy: "Find role-specific terms your resume does not yet cover.", Icon: SearchCheck },
  { title: "Resume Keyword Scanner", copy: "Compare job language against resume skills and experience.", Icon: ScanSearch },
  { title: "AI Bullet Rewrites", copy: "Turn vague bullets into clearer, evidence-based statements.", Icon: WandSparkles },
  { title: "Watermarked Free Preview", copy: "Download a useful free report with preview watermarking.", Icon: Stamp },
  { title: "Clean Export After Unlock", copy: "Mock payment state removes the watermark for the current report.", Icon: LockKeyhole }
];

const seoBlocks = [
  ["Resume match score", "Understand how closely your resume aligns with a specific job description before you apply."],
  ["Missing keywords", "Prioritize important skills and tools from the posting without stuffing your resume."],
  ["Job-tailored summary", "Create a concise professional summary that reflects the target role honestly."],
  ["Safe guidance", "Use estimated ATS insights as practical guidance, never as a guarantee of hiring results."]
];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ _ptxn?: string; token?: string }> }) {
  const { _ptxn: paddleTransactionId, token } = await searchParams;
  if (paddleTransactionId) {
    const params = new URLSearchParams({ _ptxn: paddleTransactionId });
    if (token) params.set("token", token);
    redirect(`/checkout?${params.toString()}`);
  }

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } }))
        }}
      />

      <section className="container grid gap-10 pb-16 pt-10 lg:grid-cols-[660px_1fr] lg:items-start">
        <div className="pt-6">
          <p className="inline-flex h-[34px] items-center rounded-full border border-[#dde7f5] bg-white px-5 text-sm font-extrabold text-[#2563eb] shadow-sm">
            Free ATS resume checker
          </p>
          <h1 className="mt-5 max-w-[660px] text-5xl font-black leading-[1.02] tracking-tight text-[#0b1220] md:text-7xl">
            Match Your Resume to Any Job Description in Seconds
          </h1>
          <p className="mt-6 max-w-[610px] text-xl leading-[1.55] text-[#64748b]">
            Upload your resume, paste the job description, and get an instant ATS match score with missing keywords and resume fixes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="#checker" className="primary-button focus-ring flex min-h-[54px] items-center rounded-xl px-7 font-extrabold shadow-sm">
              Check My Resume Free
            </Link>
            <Link href="#example-report" className="focus-ring flex min-h-[54px] items-center rounded-xl border border-[#dde7f5] bg-white px-7 font-extrabold text-[#0b1220] hover:bg-slate-50">
              See Example Report
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-[#64748b]">No signup required. Free preview available.</p>
            <ActiveUsersBadge />
          </div>
        </div>

        <div id="example-report" className="rounded-[28px] border border-[#dde7f5] bg-white p-8 shadow-[0_24px_70px_-36px_rgba(8,20,51,0.26)]">
          <div className="flex items-center justify-between gap-4">
            <p className="font-extrabold text-[#0b1220]">Example match report</p>
            <p className="text-xs font-bold text-[#64748b]">Watermarked preview</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[170px_1fr]">
            <div className="rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-5">
              <p className="text-sm font-bold text-[#64748b]">ATS score</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-6xl font-black text-[#16a34a]">86</span>
                <span className="pb-2 text-sm font-extrabold text-[#64748b]">/100</span>
              </div>
              <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-[#16a34a]">Strong</span>
            </div>
            <div className="rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-5">
              <p className="text-sm font-bold text-[#64748b]">Missing keywords</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["CRM", "forecasting", "pipeline", "HubSpot"].map((item) => (
                  <span key={item} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#2563eb]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="watermark mt-6 rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-6">
            <p className="font-extrabold text-[#0b1220]">Optimized resume preview</p>
            <div className="mt-5 space-y-5">
              {[82, 64, 82, 64, 82].map((width, index) => (
                <div key={index} className="h-2 rounded-full bg-[#dbe7f8]" style={{ width: `${width}%` }} />
              ))}
            </div>
            <button className="focus-ring relative z-10 mt-8 h-[38px] rounded-xl bg-[#d97706] px-6 text-sm font-extrabold text-white">
              Remove Watermark - $4.99
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#64748b]">
            Estimated score only. Hiring decisions and ATS systems vary by company.
          </p>
        </div>
      </section>

      <div className="container scroll-mt-28">
        <ResumeJobForm />
      </div>

      <section className="container mt-24">
        <h2 className="text-4xl font-black tracking-tight text-[#0b1220]">How it works</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ number, title, copy, Icon }) => (
            <article key={title} className="group rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_16px_38px_-28px_rgba(8,20,51,0.2)] transition hover:-translate-y-1 hover:border-[#bfd1ea] hover:shadow-[0_22px_48px_-30px_rgba(8,20,51,0.32)]">
              <span className="flex size-[46px] items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                <Icon aria-hidden="true" size={23} strokeWidth={2.4} />
              </span>
              <span className="mt-5 inline-flex text-xs font-black uppercase tracking-wide text-[#2563eb]">{number}</span>
              <h3 className="mt-6 text-xl font-extrabold text-[#0b1220]">{title}</h3>
              <p className="mt-2 leading-6 text-[#64748b]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mt-24">
        <h2 className="max-w-4xl text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">Everything you need to tailor a resume for one job</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ title, copy, Icon }) => (
            <article key={title} className="group rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_16px_38px_-28px_rgba(8,20,51,0.2)] transition hover:-translate-y-1 hover:border-[#bfd1ea] hover:shadow-[0_22px_48px_-30px_rgba(8,20,51,0.32)]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.8)]">
                <Icon aria-hidden="true" size={25} strokeWidth={2.35} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-[#0b1220]">{title}</h3>
              <p className="mt-4 leading-6 text-[#64748b]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mt-24 rounded-[28px] bg-[#0b1220] px-8 py-14 text-white md:px-10">
        <h2 className="max-w-4xl text-4xl font-black tracking-tight md:text-5xl">Simple pricing that turns free value into clean exports</h2>
        <p className="mt-4 text-lg text-slate-300">Start free, then remove the watermark only when the report is worth keeping.</p>
        <div className="mt-10">
          <PricingCards />
        </div>
        <p className="mt-8 text-sm text-slate-400">Development uses mock unlock. Production uses Paddle checkout and verified webhooks.</p>
      </section>

      <section className="container mt-24">
        <h2 className="max-w-4xl text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">A resume matcher built for useful, trustworthy guidance</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {seoBlocks.map(([title, copy], index) => (
            <article key={title} className="rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                  {index === 0 ? <Gauge aria-hidden="true" size={22} /> : index === 1 ? <SearchCheck aria-hidden="true" size={22} /> : index === 2 ? <FileCheck2 aria-hidden="true" size={22} /> : <ShieldCheck aria-hidden="true" size={22} />}
                </span>
                <h3 className="text-2xl font-extrabold text-[#0b1220]">{title}</h3>
              </div>
              <p className="mt-3 leading-7 text-[#64748b]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mt-24">
        <h2 className="text-4xl font-black tracking-tight text-[#0b1220]">Frequently asked questions</h2>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-[18px] border border-[#dde7f5] bg-white px-7 py-5">
              <summary className="cursor-pointer text-lg font-extrabold text-[#0b1220]">{faq.question}</summary>
              <p className="mt-3 leading-7 text-[#64748b]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
