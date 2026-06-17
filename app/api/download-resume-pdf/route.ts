import { NextRequest, NextResponse } from "next/server";
import { requirePaidAnalysis } from "@/lib/download-auth";
import { buildOptimizedResumePdf } from "@/lib/resume-export";

export async function GET(request: NextRequest) {
  const paid = await requirePaidAnalysis(request);
  if (!paid.ok) return paid.response;

  const pdf = buildOptimizedResumePdf(paid.analysis);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="optimized-resume-jobresumematch.pdf"'
    }
  });
}
