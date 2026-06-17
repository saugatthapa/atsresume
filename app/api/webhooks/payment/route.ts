import { NextRequest, NextResponse } from "next/server";
import { getPaddleConfig, isExpectedPaddlePrice, isPaidPaddleTransaction, PaddleEvent, verifyPaddleWebhookSignature } from "@/lib/payments";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("paddle-signature");
  const { webhookSecret } = getPaddleConfig();

  if (!webhookSecret) {
    // TODO: Set PADDLE_WEBHOOK_SECRET from the Paddle notification destination before production launch.
    return NextResponse.json({ error: "Payment webhook is not configured." }, { status: 500 });
  }

  if (!verifyPaddleWebhookSignature({ payload, signatureHeader: signature, secret: webhookSecret })) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as PaddleEvent;
  if (event.event_type !== "transaction.completed" && event.event_type !== "transaction.paid") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const transaction = event.data;
  const token = transaction?.custom_data?.token;
  if (!transaction || !token || !isPaidPaddleTransaction(transaction)) {
    return NextResponse.json({ received: true, paid: false });
  }
  if (!isExpectedPaddlePrice(transaction)) {
    return NextResponse.json({ error: "Unexpected Paddle price." }, { status: 400 });
  }

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

  return NextResponse.json({ received: true, paid: true });
}
