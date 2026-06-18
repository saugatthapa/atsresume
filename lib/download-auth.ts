import { NextRequest, NextResponse } from "next/server";
import { analysisSchema, AnalysisResult } from "@/lib/schema";
import { ensureDatabase, prisma } from "@/lib/prisma";

export type PaidDownloadResult =
  | { ok: true; token: string; analysis: AnalysisResult }
  | { ok: false; response: NextResponse };

const paymentRequired = {
  error: "payment_required",
  message: "Unlock downloads to export your optimized resume."
};

export async function requirePaidAnalysis(request: NextRequest): Promise<PaidDownloadResult> {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "missing_token", message: "Missing token." }, { status: 400 })
    };
  }

  await ensureDatabase();
  const record = await prisma.analysis.findUnique({ where: { token } });
  if (!record) {
    return {
      ok: false,
      response: NextResponse.json({ error: "not_found", message: "Result not found." }, { status: 404 })
    };
  }

  if (!record.paidStatus) {
    return {
      ok: false,
      response: NextResponse.json(paymentRequired, { status: 402 })
    };
  }

  // Paid exports intentionally use structured analysisJson only. Raw resume/job text
  // stays null at analysis creation unless a future feature explicitly needs it.
  const parsed = analysisSchema.safeParse(record.analysisJson);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_result", message: "Invalid result." }, { status: 500 })
    };
  }

  return { ok: true, token, analysis: parsed.data };
}
