import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PricingCards } from "@/components/PricingCards";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Pricing | JobResumeMatch",
  description: "Use JobResumeMatch free with watermarked exports or unlock clean PDF downloads for the current resume match.",
  path: "/pricing"
});

export default function PricingPage() {
  return (
    <>
      <Breadcrumbs current="Pricing" />
      <main className="container py-12">
        <h1 className="text-4xl font-black text-slate-950">Pricing</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
          Start with a free analysis. Paid unlocks are designed for job seekers who want clean exports without subscriptions or accounts.
        </p>
        <div className="mt-8">
          <PricingCards />
        </div>
      </main>
    </>
  );
}
