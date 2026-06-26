import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token || token.length < 20) {
    return NextResponse.json({ paidStatus: false }, { status: 400 });
  }

  await ensureDatabase();
  const analysis = await prisma.analysis.findUnique({
    where: { token },
    select: { paidStatus: true }
  });

  if (!analysis) {
    return NextResponse.json({ paidStatus: false }, { status: 404 });
  }

  return NextResponse.json({ paidStatus: analysis.paidStatus });
}
