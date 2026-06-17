import Link from "next/link";

const plans = [
  { name: "Free Preview", price: "$0", detail: "Run analysis, see top gaps, download watermarked PDF.", cta: "Choose Plan" },
  { name: "Remove Watermark", price: "$4.99", detail: "Unlock the current optimized resume and clean PDF export.", cta: "Unlock Clean Export", recommended: true },
  { name: "3 Resume Matches", price: "$9.99", detail: "Draft pack pricing for repeated applications.", cta: "Choose Plan" },
  { name: "7-Day Pass", price: "$14.99", detail: "Draft unlimited pass for a focused job search week.", cta: "Choose Plan" }
];

export function PricingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <article key={plan.name} className="flex min-h-[320px] flex-col rounded-[24px] border border-white/15 bg-white p-6 text-[#0b1220] shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)]">
          <div className="min-h-[78px]">
            {plan.recommended && <span className="mb-3 inline-flex rounded-full bg-[#16a34a] px-3 py-1 text-xs font-black uppercase text-white">Recommended</span>}
            <h3 className="max-w-[210px] text-xl font-extrabold leading-[1.35]">{plan.name}</h3>
          </div>
          <p className="mt-2 text-5xl font-black leading-none text-[#2563eb]">{plan.price}</p>
          <p className="mt-5 min-h-[72px] text-sm leading-7 text-[#64748b]">{plan.detail}</p>
          <div className="my-6 h-px bg-[#dde7f5]" />
          <p className="min-h-[44px] text-sm font-extrabold leading-6 text-[#0b1220]">{plan.name === "Free Preview" ? "Watermarked export included" : "Current MVP checkout placeholder"}</p>
          <Link href="/#checker" className="primary-button focus-ring mt-auto flex h-[52px] items-center justify-center rounded-xl px-4 text-center text-sm font-extrabold shadow-sm">
            {plan.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
