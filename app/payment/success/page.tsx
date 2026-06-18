import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { isExpectedPaddlePrice, isPaidPaddleTransaction, retrievePaddleTransaction } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Payment Success | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string; transaction_id?: string }> }) {
  const { token, transaction_id: transactionId } = await searchParams;
  if (!token) redirect("/");

  if (transactionId) {
    try {
      const transaction = await retrievePaddleTransaction(transactionId);
      const transactionToken = transaction.custom_data?.token;

      if (transactionToken === token && isPaidPaddleTransaction(transaction) && isExpectedPaddlePrice(transaction)) {
        await ensureDatabase();
        await prisma.analysis.updateMany({
          where: { token },
          data: {
            paidStatus: true,
            paymentProvider: "paddle",
            paymentSessionId: transaction.id,
            paymentOrderId: transaction.payments?.[0]?.payment_attempt_id || transaction.id,
            paymentStatus: transaction.status || "paid"
          }
        });

        redirect(`/result/${token}`);
      }
    } catch (error) {
      console.error("[paddle.success] payment confirmation failed", {
        transactionId,
        errorMessage: error instanceof Error ? error.message : "Unknown payment confirmation failure."
      });
    }
  }

  return (
    <main className="container py-20">
      <div className="max-w-2xl rounded-[28px] border border-[#dde7f5] bg-white p-8 shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
        <h1 className="text-4xl font-black text-[#0b1220]">Payment received</h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          Payment received. Your report will unlock once payment is confirmed.
        </p>
        <Link className="primary-button focus-ring mt-6 inline-flex rounded-xl px-5 py-3 font-extrabold" href={`/result/${token}`}>
          Return to result
        </Link>
      </div>
    </main>
  );
}
