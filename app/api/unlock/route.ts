import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        error: "forbidden",
        message: "Mock unlock is disabled in production."
      },
      { status: 403 }
    );
  }

  try {
    const { token } = await request.json();
    if (typeof token !== "string" || token.length < 20) {
      return NextResponse.json({ error: "Missing or invalid result token." }, { status: 400 });
    }

    await ensureDatabase();
    const existing = await prisma.analysis.findUnique({ where: { token } });
    if (!existing || existing.expiresAt < new Date()) {
      return NextResponse.json({ error: "Result not found or expired." }, { status: 404 });
    }

    await prisma.analysis.update({
      where: { token },
      data: {
        paidStatus: true,
        paymentProvider: "mock",
        paymentSessionId: `dev_mock_${Date.now()}`,
        paymentStatus: "paid"
      }
    });
    return NextResponse.json({ paidStatus: true });
  } catch {
    return NextResponse.json({ error: "Unable to unlock this report." }, { status: 500 });
  }
}
