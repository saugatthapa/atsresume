import { NextRequest, NextResponse } from "next/server";
import { createPaddleTransaction, PaddleCheckoutError } from "@/lib/payments";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (typeof token !== "string" || token.length < 20) {
      return NextResponse.json({ error: "Missing or invalid result token." }, { status: 400 });
    }

    await ensureDatabase();
    const analysis = await prisma.analysis.findUnique({ where: { token } });
    if (!analysis || analysis.expiresAt < new Date()) {
      return NextResponse.json({ error: "Result not found or expired." }, { status: 404 });
    }
    if (analysis.paidStatus) {
      return NextResponse.json({ paidStatus: true, redirectUrl: `/result/${token}` });
    }

    const transaction = await createPaddleTransaction({ token });
    await prisma.analysis.update({
      where: { token },
      data: {
        paymentProvider: "paddle",
        paymentSessionId: transaction.id,
        paymentOrderId: transaction.id,
        paymentStatus: transaction.status || "checkout_created"
      }
    });

    return NextResponse.json({ checkoutUrl: transaction.checkout?.url, sessionId: transaction.id, transactionId: transaction.id });
  } catch (error) {
    if (error instanceof PaddleCheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create checkout." }, { status: 500 });
  }
}
