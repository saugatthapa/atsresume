import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Payment Success | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string; provider?: string }> }) {
  const { token, provider } = await searchParams;
  if (!token) redirect("/");

  let unlocked = false;
  if (provider === "dodo") {
    await ensureDatabase();
    const analysis = await prisma.analysis.findUnique({ where: { token }, select: { paidStatus: true } });
    unlocked = analysis?.paidStatus === true;
  }

  return (
    <main className="container py-20">
      <div className="max-w-2xl rounded-[28px] border border-[#dde7f5] bg-white p-8 shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
        <h1 className="text-4xl font-black text-[#0b1220]">Payment received</h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          {unlocked
            ? "Your Resume Export Pass is unlocked."
            : "Payment received. Your Resume Export Pass will unlock once payment confirmation is received."}
        </p>
        {!unlocked && (
          <p className="mt-3 leading-7 text-[#64748b]">
            Payment confirmation may take a moment. Please refresh your result page shortly.
          </p>
        )}
        <Link className="primary-button focus-ring mt-6 inline-flex rounded-xl px-5 py-3 font-extrabold" href={`/result/${token}`}>
          Open Result
        </Link>
      </div>
    </main>
  );
}
