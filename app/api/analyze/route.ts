import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { analyzeWithAi } from "@/lib/ai";
import { extractFileText, FileParsingError } from "@/lib/file-parser";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { analyzeInputSchema } from "@/lib/schema";
import { formatZodError } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limited = rateLimit(ip);
  if (!limited.ok) return NextResponse.json({ error: "Too many analyses. Please try again later." }, { status: 429 });

  try {
    await ensureDatabase();
    const contentType = request.headers.get("content-type") || "";
    let resumeText = "";
    let jobDescription = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      resumeText = String(form.get("resumeText") || "");
      jobDescription = String(form.get("jobDescription") || "");
      const file = form.get("resumeFile");
      if (file instanceof File && file.size > 0) {
        resumeText = `${resumeText}\n${await extractFileText(file)}`.trim();
      }
    } else {
      const body = await request.json();
      resumeText = body.resumeText;
      jobDescription = body.jobDescription;
    }

    const parsed = analyzeInputSchema.safeParse({ resumeText, jobDescription });
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    // analyzeWithAi returns post-processed output; optimizedResumePreview is derived from and validated against the user's original resume before storage.
    const analysis = await analyzeWithAi(parsed.data.resumeText, parsed.data.jobDescription);
    const token = randomUUID();
    await prisma.analysis.create({
      data: {
        token,
        // Privacy: raw resume/job text can contain personal data, so do not persist it.
        // Result pages and exports are rebuilt from the structured analysisJson payload.
        resumeText: null,
        jobDescriptionText: null,
        analysisJson: analysis,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    return NextResponse.json({ token, analysis });
  } catch (error) {
    if (error instanceof FileParsingError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[api/analyze] Analysis failed", {
      message: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ error: "Unable to analyze resume right now. Please try again." }, { status: 500 });
  }
}
