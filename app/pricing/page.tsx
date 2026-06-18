import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PricingCards } from "@/components/PricingCards";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Pricing | JobResumeMatch",
  description: "Check your resume for free. Unlock clean PDF, editable DOCX, and the full ATS report only when the result is worth keeping.",
  path: "/pricing"
});

export default function PricingPage() {
  return (
    <>
      <Breadcrumbs current="Pricing" />
      <main className="container py-12">
        <h1 className="text-4xl font-black text-slate-950">Simple pricing for clean resume exports</h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">
          Check your resume for free. Unlock clean PDF, editable DOCX, and the full ATS report only when the result is worth keeping.
        </p>
        <div className="mt-8">
          <PricingCards />
        </div>
      </main>
    </>
  );
}
