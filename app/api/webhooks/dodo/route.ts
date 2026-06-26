import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { isExpectedDodoProduct, parseDodoWebhookEvent, verifyDodoWebhook, type DodoWebhookEvent } from "@/lib/payments/dodo";

const paidEvents = new Set(["payment.succeeded"]);
const loggedEvents = new Set(["payment.failed", "payment.cancelled", "payment.processing", "refund.succeeded"]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifyDodoWebhook({ rawBody, headers: request.headers })) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: DodoWebhookEvent;
  try {
    event = JSON.parse(rawBody) as DodoWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { eventType, token, productId, paymentId } = parseDodoWebhookEvent(event);

  if (!eventType) {
    console.warn("[dodo.webhook] missing event type");
    return NextResponse.json({ received: true });
  }

  if (loggedEvents.has(eventType)) {
    console.warn("[dodo.webhook] non-success event received", { eventType, paymentId });
    return NextResponse.json({ received: true });
  }

  if (!paidEvents.has(eventType)) {
    return NextResponse.json({ received: true });
  }

  if (!token) {
    console.warn("[dodo.webhook] paid event missing token metadata", { eventType, paymentId });
    return NextResponse.json({ received: true });
  }

  if (!isExpectedDodoProduct(productId)) {
    console.warn("[dodo.webhook] unexpected product id", { eventType, paymentId, productId });
    return NextResponse.json({ error: "unexpected_product" }, { status: 400 });
  }

  await ensureDatabase();
  const analysis = await prisma.analysis.findUnique({ where: { token } });
  if (!analysis) {
    console.warn("[dodo.webhook] analysis not found", { eventType, paymentId });
    return NextResponse.json({ received: true });
  }

  if (!analysis.paidStatus) {
    await prisma.analysis.update({
      where: { token },
      data: {
        paidStatus: true,
        paymentProvider: "dodo",
        paymentSessionId: paymentId || analysis.paymentSessionId,
        paymentOrderId: paymentId || analysis.paymentOrderId,
        paymentStatus: eventType
      }
    });
  }

  return NextResponse.json({ received: true });
}
