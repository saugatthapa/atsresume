import { fallbackAnalyze, postProcessAnalysis } from "@/lib/analyzer";
import { AnalysisResult, analysisSchema } from "@/lib/schema";

export async function analyzeWithAi(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  console.info("[analyze.ai] provider selected", {
    provider: apiKey ? "groq" : "local_fallback",
    model,
    hasGroqApiKey: Boolean(apiKey)
  });

  if (!apiKey) {
    console.info("[analyze.ai] using local fallback", { reason: "missing_groq_api_key" });
    return fallbackAnalyze(resumeText, jobDescription);
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an ATS resume matching assistant. Return only valid JSON matching the requested schema. Be evidence-based, do not guarantee interviews or ATS acceptance, and do not invent skills or personal data not present in the resume. Do not invent facts. Only rewrite using information present in the original resume."
          },
          {
            role: "user",
            content: `Analyze this resume against this job description. Score using keyword overlap 40%, required skills 25%, experience/title relevance 15%, ATS formatting 10%, bullet strength 10%. JSON keys: score, scoreLabel, summary, missingKeywords, matchedKeywords, skillsFound, skillsMissing, weakBulletPoints[{original,problem,improved}], jobTailoredSummary, atsChecklist[{item,status,recommendation}], optimizedResumePreview.\n\nStrict rules: Do not invent facts. Only rewrite using information present in the original resume. Never invent or change name, email, phone, location, LinkedIn, GitHub, education, degree, school, dates, job titles, metrics, or company names. Bullet rewrites must start with a natural action verb, must not invent numbers, and must not prepend generic words like Strengthened, Improved, or Enhanced to a complete original sentence.\n\nResume:\n${resumeText}\n\nJob description:\n${jobDescription}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`Groq request failed: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = analysisSchema.safeParse(parseAiJson(content));
    if (!parsed.success) throw new Error("AI response did not match schema");
    console.info("[analyze.ai] groq response parsed", { parseSuccess: true });
    return postProcessAnalysis(parsed.data, resumeText, jobDescription);
  } catch (error) {
    console.warn("[analyze.ai] groq unavailable, using local fallback", {
      parseSuccess: false,
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown Groq analysis failure."
    });
    return fallbackAnalyze(resumeText, jobDescription);
  }
}

function parseAiJson(content: unknown) {
  if (typeof content !== "string") throw new Error("AI response was empty");
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
    if (fenced) return JSON.parse(fenced);

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("AI response did not contain JSON");
  }
}
