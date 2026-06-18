import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Canceled | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default async function PaymentCancelPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const href = token ? `/result/${token}` : "/";

  return (
    <main className="container py-20">
      <div className="max-w-2xl rounded-[28px] border border-[#dde7f5] bg-white p-8 shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
        <h1 className="text-4xl font-black text-[#0b1220]">Payment canceled</h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          No payment was completed. Your free preview is still available, and you can unlock clean exports again from the result page.
        </p>
        <Link className="focus-ring mt-6 inline-flex rounded-xl border border-[#dde7f5] bg-white px-5 py-3 font-extrabold text-[#0b1220] hover:bg-slate-50" href={href}>
          Return to result
        </Link>
      </div>
    </main>
  );
}
