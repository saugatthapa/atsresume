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
    console.info("[api/analyze] request received", {
      hasGroqApiKey: Boolean(process.env.GROQ_API_KEY),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      aiProvider: process.env.GROQ_API_KEY ? "groq" : "local_fallback",
      aiModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"
    });

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

    console.info("[api/analyze] input validated", {
      resumeLength: parsed.data.resumeText.length,
      jobDescriptionLength: parsed.data.jobDescription.length
    });

    // analyzeWithAi returns post-processed output; optimizedResumePreview is derived from and validated against the user's original resume before storage.
    const analysis = await analyzeWithAi(parsed.data.resumeText, parsed.data.jobDescription);
    console.info("[api/analyze] analysis generated", {
      score: analysis.score,
      matchedKeywordCount: analysis.matchedKeywords.length,
      missingKeywordCount: analysis.missingKeywords.length
    });

    const token = randomUUID();
    console.info("[api/analyze] token created", { token });

    try {
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
      console.info("[api/analyze] prisma create succeeded", { token });
    } catch (error) {
      console.error("[api/analyze] prisma create failed", {
        token,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        errorName: error instanceof Error ? error.name : "unknown",
        errorMessage: summarizeError(error)
      });
      return NextResponse.json({ error: "We could not save your result. Please try again.", code: "save_failed" }, { status: 500 });
    }

    return NextResponse.json({ token, redirectUrl: `/result/${encodeURIComponent(token)}`, analysis });
  } catch (error) {
    if (error instanceof FileParsingError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[api/analyze] Analysis failed", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: summarizeError(error)
    });
    return NextResponse.json({ error: "The analyzer is temporarily unavailable. Please try again in a moment.", code: "analyze_failed" }, { status: 500 });
  }
}

function summarizeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\s+/g, " ").slice(0, 500);
}
