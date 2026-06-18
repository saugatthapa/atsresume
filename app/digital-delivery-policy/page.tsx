import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

const unlockedItems = [
  "Full optimized resume",
  "Clean resume PDF",
  "Editable DOCX",
  "Full ATS match report",
  "Keyword and bullet improvement suggestions"
];

const supportDetails = ["Payment email", "Result page link", "Approximate payment time", "Screenshot of the issue if possible"];

export const metadata = createMetadata({
  title: "Digital Delivery Policy | JobResumeMatch",
  description: "Learn how JobResumeMatch delivers the Resume Export Pass, optimized resume PDF, editable DOCX, and full ATS match report after payment.",
  path: "/digital-delivery-policy"
});

export default function DigitalDeliveryPolicyPage() {
  return (
    <>
      <Breadcrumbs current="Digital Delivery Policy" />
      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">Digital Delivery Policy</h1>
        <p className="mt-6 text-lg leading-8 text-[#53657d]">JobResumeMatch provides digital resume export access.</p>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">After purchase</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            After purchasing the Resume Export Pass, the current resume and job description result should unlock automatically. Once unlocked, users can access:
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {unlockedItems.map((item) => (
              <li key={item} className="rounded-2xl bg-[#fbfdff] px-4 py-3 font-semibold text-[#53657d]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-6">
            <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Delivery method</h2>
            <p className="mt-3 leading-7 text-[#64748b]">The files are delivered through the unlocked result page. No physical product is shipped.</p>
          </div>
          <div className="rounded-[22px] border border-[#dde7f5] bg-white p-6">
            <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Access time</h2>
            <p className="mt-3 leading-7 text-[#64748b]">
              Access is usually available immediately after successful payment confirmation. In some cases, payment confirmation may take a short time.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">If access does not unlock</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            Contact support at:{" "}
            <a className="font-extrabold text-[#2563eb] hover:text-[#1d4ed8]" href="mailto:saugatthapa43@gmail.com">
              saugatthapa43@gmail.com
            </a>
          </p>
          <p className="mt-5 font-extrabold text-[#0b1220]">Include:</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {supportDetails.map((item) => (
              <li key={item} className="rounded-2xl bg-[#fbfdff] px-4 py-3 font-semibold text-[#53657d]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-[#fbfdff] p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Disclaimer</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            JobResumeMatch is a digital service. It provides estimated resume match guidance and does not guarantee hiring results.
          </p>
        </section>
      </main>
    </>
  );
}
