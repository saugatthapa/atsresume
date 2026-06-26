import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Free Preview",
    price: "$0",
    detail: "Check your resume against a job description for free and preview the most important improvements.",
    cta: "Check Resume Free",
    features: ["ATS match score", "Missing keywords", "Matched skills", "Limited optimized resume preview", "One bullet rewrite preview", "No downloads included"]
  },
  {
    name: "Resume Export Pass",
    label: "One-time unlock",
    price: "$4.99",
    detail: "One-time unlock for this resume and job match. Export your optimized resume with clean downloadable files.",
    cta: "Start Free Check",
    recommended: true,
    features: ["Full optimized resume", "Clean resume PDF", "Editable DOCX", "Full ATS match report", "All keyword and bullet suggestions", "No watermark on exports"]
  }
];

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <article
          key={plan.name}
          className={`flex h-full min-h-[500px] flex-col rounded-[24px] border bg-white p-7 text-[#0b1220] shadow-[0_18px_44px_-28px_rgba(8,20,51,0.28)] ${
            plan.recommended ? "border-[#2563eb] ring-4 ring-blue-100" : "border-[#dde7f5]"
          }`}
        >
          <div className="min-h-[118px]">
            {plan.recommended && <span className="mb-4 inline-flex rounded-full bg-[#16a34a] px-3 py-1 text-xs font-black uppercase text-white">Recommended</span>}
            <h3 className="text-2xl font-black leading-tight">{plan.name}</h3>
            {"label" in plan && <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#2563eb]">{plan.label}</p>}
            <p className="mt-3 text-sm leading-6 text-[#64748b]">{plan.detail}</p>
          </div>

          <p className="mt-6 text-5xl font-black leading-none text-[#2563eb]">{plan.price}</p>

          <div className="my-7 h-px bg-[#dde7f5]" />

          <ul className="grid gap-3 text-sm font-semibold leading-6 text-[#53657d]">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <CheckCircle2 aria-hidden="true" size={17} className="mt-1 shrink-0 text-[#16a34a]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link href="/#checker" className="primary-button focus-ring mt-auto flex h-[52px] items-center justify-center rounded-xl px-4 text-center text-sm font-extrabold shadow-sm">
            {plan.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
