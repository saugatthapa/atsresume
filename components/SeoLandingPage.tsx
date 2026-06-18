import Link from "next/link";
import { ArrowRight, CheckCircle2, Gauge, HelpCircle, ListChecks, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ResumeJobForm } from "@/components/ResumeJobForm";
import type { SeoPage } from "@/lib/content";

export function SeoLandingPage({ page }: { page: SeoPage }) {
  const relatedLinks = [
    { href: "/ats-resume-checker", label: "ATS resume checker" },
    { href: "/resume-match-score", label: "Resume match score" },
    { href: "/resume-keyword-scanner", label: "Resume keyword scanner" },
    { href: "/match-resume-to-job-description", label: "Match resume to job description" },
    { href: "/resume-optimizer", label: "Resume optimizer" },
    { href: "/free-resume-checker", label: "Free resume checker" }
  ].filter((link) => link.href !== page.slug);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <>
      <Breadcrumbs current={page.h1} />
      <main className="container py-10">
        <JsonLd data={faq} />
        <section className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-sm">
              <Sparkles aria-hidden="true" size={16} />
              JobResumeMatch tool
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#0b1220] md:text-6xl">{page.h1}</h1>
            <p className="mt-6 text-lg leading-8 text-[#64748b]">{page.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#checker" className="primary-button focus-ring inline-flex min-h-[50px] items-center gap-2 rounded-xl px-5 font-extrabold shadow-sm">
                Check Your Resume Match Now
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link href="/resume-match-score" className="focus-ring inline-flex min-h-[50px] items-center rounded-xl border border-[#dde7f5] bg-white px-5 font-extrabold text-[#0b1220] hover:bg-slate-50">
                Learn About Scores
              </Link>
            </div>
          </div>
          <ResumeJobForm />
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-3">
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <Users aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-[#0b1220]">Who it helps</h2>
            <p className="mt-3 leading-7 text-[#64748b]">{page.audience}</p>
          </div>
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)] md:col-span-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <ListChecks aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-[#0b1220]">Practical ways to improve your match</h2>
            <ul className="mt-5 grid gap-3">
              {page.tips.map((tip) => (
                <li key={tip} className="flex gap-3 rounded-2xl bg-[#fbfdff] p-4 text-[#64748b]">
                  <CheckCircle2 aria-hidden="true" size={19} className="mt-0.5 shrink-0 text-[#16a34a]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-2">
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <Gauge aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-[#0b1220]">How JobResumeMatch scores your resume</h2>
            <p className="mt-3 leading-7 text-[#64748b]">
              The checker combines keyword overlap, required skill coverage, experience relevance, ATS formatting, and bullet strength. The result is an estimated match score plus specific evidence you can review.
            </p>
          </div>
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <ShieldCheck aria-hidden="true" size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-[#0b1220]">What the free report includes</h2>
            <p className="mt-3 leading-7 text-[#64748b]">
              Free reports include the score, top missing keywords, matched skills, basic suggestions, and an optimized preview. Paid unlock gives the full optimized resume, editable DOCX, clean PDF, and full ATS report for the current resume and job description.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
            <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">How to use this checker</h2>
            <ol className="mt-5 grid gap-3 text-[#64748b]">
              {["Upload or paste your resume.", "Paste the exact job description you want to apply for.", "Review your estimated resume match score and missing resume keywords.", "Use the resume bullet suggestions and optimized preview to improve the application.", "Unlock clean PDF, editable DOCX, and the full ATS match report only when the result is worth keeping."].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl bg-[#fbfdff] p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-[#2563eb]">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
            <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">What you can review</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["ATS resume match score", "Missing resume keywords", "Matched skills", "Resume keyword match", "Resume bullet suggestions", "Limited optimized resume preview", "Editable DOCX after unlock", "Full ATS match report after unlock"].map((feature) => (
                <div key={feature} className="flex gap-2 rounded-2xl bg-[#fbfdff] p-4 text-sm font-semibold text-[#53657d]">
                  <CheckCircle2 aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-[#16a34a]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[22px] border border-[#dde7f5] bg-white p-7 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Related resume tools and guides</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {relatedLinks.slice(0, 5).map((link) => (
              <Link key={link.href} href={link.href} className="focus-ring rounded-full border border-[#dde7f5] bg-[#fbfdff] px-4 py-2 text-sm font-extrabold text-[#2563eb] hover:bg-blue-50">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <HelpCircle aria-hidden="true" size={22} />
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[#0b1220]">FAQ</h2>
          </div>
          <div className="grid gap-4">
            {page.faq.map((item) => (
              <details key={item.question} className="rounded-[18px] border border-[#dde7f5] bg-white px-7 py-5">
                <summary className="cursor-pointer text-lg font-extrabold text-[#0b1220]">{item.question}</summary>
                <p className="mt-3 leading-7 text-[#64748b]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
