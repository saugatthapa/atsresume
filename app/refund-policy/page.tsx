import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

const refundsMayApply = [
  "A duplicate payment was made.",
  "The payment was accidental.",
  "The export pass did not unlock after successful payment.",
  "PDF, DOCX, or report downloads failed and support could not fix the issue.",
  "The customer contacted support within 7 days of purchase."
];

const refundsMayNotApply = [
  "The digital files were successfully unlocked and downloaded.",
  "The customer simply changed their mind after using the unlocked result.",
  "The resume score or suggestions were different from what the customer expected.",
  "The customer expected interviews, job offers, or ATS approval as a certain outcome."
];

const requestDetails = ["Payment email", "Approximate payment date", "Result page link if available", "Reason for refund request"];

export const metadata = createMetadata({
  title: "Refund Policy | JobResumeMatch",
  description: "Read the JobResumeMatch refund policy for Resume Export Pass purchases, duplicate payments, technical issues, and digital product access.",
  path: "/refund-policy"
});

export default function RefundPolicyPage() {
  return (
    <>
      <Breadcrumbs current="Refund Policy" />
      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">Refund Policy</h1>
        <div className="mt-6 space-y-5 text-lg leading-8 text-[#53657d]">
          <p>
            JobResumeMatch sells a digital Resume Export Pass. The pass unlocks the full optimized resume, clean PDF, editable DOCX, and full ATS match report for the current resume and job description result.
          </p>
        </div>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Refunds may be considered when</h2>
          <ul className="mt-5 grid gap-3">
            {refundsMayApply.map((item) => (
              <li key={item} className="rounded-2xl bg-[#fbfdff] px-4 py-3 leading-7 text-[#53657d]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#fde2c0] bg-[#fff8ed] p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Refunds may not be available when</h2>
          <ul className="mt-5 grid gap-3">
            {refundsMayNotApply.map((item) => (
              <li key={item} className="rounded-2xl bg-white px-4 py-3 leading-7 text-[#53657d]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Important disclaimer</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            JobResumeMatch provides resume improvement guidance only. We do not guarantee interviews, job offers, or ATS approval.
          </p>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Refund requests</h2>
          <p className="mt-3 leading-7 text-[#64748b]">
            To request a refund, contact:{" "}
            <a className="font-extrabold text-[#2563eb] hover:text-[#1d4ed8]" href="mailto:saugatthapa43@gmail.com">
              saugatthapa43@gmail.com
            </a>
          </p>
          <p className="mt-5 font-extrabold text-[#0b1220]">Include:</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {requestDetails.map((item) => (
              <li key={item} className="rounded-2xl bg-[#fbfdff] px-4 py-3 font-semibold text-[#53657d]">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 leading-7 text-[#64748b]">
            Payments are processed securely by our checkout provider. Refund processing may depend on payment records and review.
          </p>
        </section>
      </main>
    </>
  );
}
