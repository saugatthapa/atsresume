import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

const supportTopics = [
  "Payment or checkout issue",
  "Resume Export Pass access issue",
  "PDF or DOCX download issue",
  "Refund request",
  "Privacy or data request",
  "General support"
];

export const metadata = createMetadata({
  title: "Contact JobResumeMatch Support",
  description: "Contact JobResumeMatch for support with payments, resume exports, refund requests, privacy questions, and technical issues.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs current="Contact" />
      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-black tracking-tight text-[#0b1220] md:text-5xl">Contact JobResumeMatch</h1>
        <p className="mt-5 text-lg leading-8 text-[#53657d]">
          Need help with JobResumeMatch? Contact us for payment issues, download problems, refund requests, privacy questions, or product support.
        </p>
        <div className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Support email</h2>
          <a className="mt-3 inline-flex font-extrabold text-[#2563eb] hover:text-[#1d4ed8]" href="mailto:saugatthapa43@gmail.com">
            saugatthapa43@gmail.com
          </a>
          <p className="mt-4 leading-7 text-[#64748b]">
            We try to respond as soon as possible. Please include your result link or payment email if your question is about a paid export.
          </p>
        </div>
        <section className="mt-8">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Support topics</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {supportTopics.map((topic) => (
              <li key={topic} className="rounded-2xl border border-[#dde7f5] bg-white px-4 py-3 font-semibold text-[#53657d]">
                {topic}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
