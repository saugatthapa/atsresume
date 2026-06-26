import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PaymentSuccessStatus } from "./PaymentSuccessStatus";
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
        <PaymentSuccessStatus token={token} initialUnlocked={unlocked} />
      </div>
    </main>
  );
}
