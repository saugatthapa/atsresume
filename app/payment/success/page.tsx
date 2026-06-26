import type { Metadata } from "next";
import { PaymentSuccessStatus } from "./PaymentSuccessStatus";
import { ensureDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Payment Success | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string; provider?: string }> }) {
  const { token, provider } = await searchParams;

  let unlocked = false;
  let found = false;
  if (token && token.length >= 20) {
    await ensureDatabase();
    const analysis = await prisma.analysis.findUnique({ where: { token }, select: { paidStatus: true } });
    found = Boolean(analysis);
    unlocked = analysis?.paidStatus === true;
  }

  return (
    <main className="bg-[#f6f9ff]">
      <div className="container flex min-h-[calc(100vh-160px)] items-center justify-center py-12 sm:py-16">
        <PaymentSuccessStatus token={token} initialUnlocked={provider === "dodo" && unlocked} initialFound={found} />
      </div>
    </main>
  );
}
