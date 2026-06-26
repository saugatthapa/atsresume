import { NextRequest, NextResponse } from "next/server";
import { createDodoCheckout, DodoCheckoutError } from "@/lib/payments/dodo";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    if (process.env.PAYMENTS_ENABLED !== "true") {
      return NextResponse.json(
        { error: "payments_disabled", message: "Payments are temporarily unavailable." },
        { status: 503 }
      );
    }

    if (process.env.PAYMENT_PROVIDER !== "dodo") {
      return NextResponse.json({ error: "unsupported_payment_provider", message: "Dodo is not the active payment provider." }, { status: 503 });
    }

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
      return NextResponse.json({ alreadyPaid: true, paidStatus: true, redirectUrl: `/result/${token}` });
    }

    const checkout = await createDodoCheckout({ token, analysis });
    await prisma.analysis.update({
      where: { token },
      data: {
        paymentProvider: "dodo",
        paymentSessionId: checkout.sessionId || checkout.paymentId || null,
        paymentOrderId: checkout.paymentId || checkout.sessionId || null,
        paymentStatus: "checkout_created"
      }
    });

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
      paymentId: checkout.paymentId
    });
  } catch (error) {
    if (error instanceof DodoCheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create checkout." }, { status: 500 });
  }
}
