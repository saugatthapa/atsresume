import { z } from "zod";

export const scoreLabelSchema = z.enum(["Poor", "Fair", "Good", "Strong"]);

export const analysisSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: scoreLabelSchema,
  summary: z.string(),
  missingKeywords: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  skillsFound: z.array(z.string()),
  skillsMissing: z.array(z.string()),
  weakBulletPoints: z.array(
    z.object({
      original: z.string(),
      problem: z.string(),
      improved: z.string()
    })
  ),
  jobTailoredSummary: z.string(),
  atsChecklist: z.array(
    z.object({
      item: z.string(),
      status: z.enum(["pass", "warning", "fail"]),
      recommendation: z.string()
    })
  ),
  optimizedResumePreview: z.string()
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

export const analyzeInputSchema = z.object({
  resumeText: z
    .string()
    .trim()
    .min(300, "Paste at least 300 characters of resume text, or upload a readable resume file.")
    .max(30000, "Resume text is too long. Please keep it under 30,000 characters."),
  jobDescription: z
    .string()
    .trim()
    .min(200, "Paste at least 200 characters from the job description.")
    .max(30000, "Job description is too long. Please keep it under 30,000 characters.")
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
