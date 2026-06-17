import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Terms of Service | JobResumeMatch", description: "Terms for using JobResumeMatch AI-assisted resume analysis and export tools.", path: "/terms" });

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs current="Terms" />
      <main className="container max-w-4xl py-12">
        <h1 className="text-4xl font-black text-slate-950">Terms of Service</h1>
        <div className="mt-6 space-y-5 leading-8 text-slate-700">
          <p>JobResumeMatch provides AI-assisted resume suggestions, keyword analysis, and estimated match scoring. It does not guarantee job interviews, hiring outcomes, ATS acceptance, or employer responses.</p>
          <p>Users are responsible for reviewing, editing, and verifying all outputs. Do not add skills, credentials, or experience that you cannot support honestly.</p>
          <p>The MVP payment flow is a mock implementation. Real checkout, refunds, and payment processing terms should be added before launch.</p>
        </div>
      </main>
    </>
  );
}
