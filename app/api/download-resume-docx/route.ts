import { NextRequest, NextResponse } from "next/server";
import { requirePaidAnalysis } from "@/lib/download-auth";
import { buildOptimizedResumeDocx } from "@/lib/resume-export";

export async function GET(request: NextRequest) {
  const paid = await requirePaidAnalysis(request);
  if (!paid.ok) return paid.response;

  const docx = await buildOptimizedResumeDocx(paid.analysis);
  return new NextResponse(new Uint8Array(docx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="optimized-resume-jobresumematch.docx"'
    }
  });
}
