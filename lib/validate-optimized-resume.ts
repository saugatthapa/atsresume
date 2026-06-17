import { cleanResumeLine, extractNumbers, extractResumeFacts, factKey, ResumeFacts } from "@/lib/resume-facts";
import type { AnalysisResult } from "@/lib/schema";

export function validateOptimizedResumeAgainstSource(optimizedResumePreview: string, originalResumeText: string, extractedFacts = extractResumeFacts(originalResumeText)) {
  const optimizedFacts = extractResumeFacts(optimizedResumePreview);
  const sourceNumbers = new Set(extractedFacts.numbers);
  const optimizedNumbers = new Set(optimizedFacts.numbers);

  if (!allFactsAllowed(optimizedFacts.emails, extractedFacts.emails, "email")) return safeOriginalResume(originalResumeText, "invented email");
  if (!allFactsAllowed(optimizedFacts.phones, extractedFacts.phones, "phone")) return safeOriginalResume(originalResumeText, "invented phone");
  if (!allFactsAllowed(optimizedFacts.linkedinUrls, extractedFacts.linkedinUrls, "linkedin")) return safeOriginalResume(originalResumeText, "invented linkedin");
  if (!allFactsAllowed(optimizedFacts.githubUrls, extractedFacts.githubUrls, "github")) return safeOriginalResume(originalResumeText, "invented github");
  if (!allFactsAllowed(optimizedFacts.urls, extractedFacts.urls, "url")) return safeOriginalResume(originalResumeText, "invented url");
  if (!allFactsAllowed(optimizedFacts.companyNames, extractedFacts.companyNames, "company")) return safeOriginalResume(originalResumeText, "invented company");
  if (!allFactsAllowed(optimizedFacts.jobTitles, extractedFacts.jobTitles, "job title")) return safeOriginalResume(originalResumeText, "invented job title");
  if (!allFactsAllowed(optimizedFacts.dateRanges, extractedFacts.dateRanges, "date")) return safeOriginalResume(originalResumeText, "invented date");
  if (!allFactsAllowed(optimizedFacts.educationLines, extractedFacts.educationLines, "education")) return safeOriginalResume(originalResumeText, "invented education");
  if (!allFactsAllowed(optimizedFacts.certificationLines, extractedFacts.certificationLines, "certification")) return safeOriginalResume(originalResumeText, "invented certification");
  if (!isSubset(optimizedNumbers, sourceNumbers)) return safeOriginalResume(originalResumeText, "invented metric");

  return cleanupOriginalDerivedText(optimizedResumePreview);
}

export function validateBulletSuggestionsAgainstSource(rewrites: AnalysisResult["weakBulletPoints"], originalResumeText: string, extractedFacts: ResumeFacts) {
  const sourceNumbers = new Set(extractedFacts.numbers);
  return rewrites
    .map((item) => {
      const originalNumbers = new Set(extractNumbers(item.original));
      const allowedNumbers = new Set([...sourceNumbers, ...originalNumbers]);
      const improvedNumbers = new Set(extractNumbers(item.improved));
      const improved = isSubset(improvedNumbers, allowedNumbers) ? item.improved : item.original;
      return {
        ...item,
        original: cleanupOriginalDerivedText(item.original),
        improved: cleanupOriginalDerivedText(improved)
      };
    })
    .filter((item) => isMeaningfulRewrite(item.original, item.improved, originalResumeText, extractedFacts));
}

export function isMeaningfulRewrite(original: string, improved: string, originalResumeText: string, extractedFacts = extractResumeFacts(originalResumeText)) {
  const originalKey = factKey(original);
  const improvedKey = factKey(improved);
  if (!originalKey || !improvedKey || originalKey === improvedKey) return false;
  if (stripPunctuation(originalKey) === stripPunctuation(improvedKey)) return false;
  if (!isSubset(new Set(extractNumbers(improved)), new Set([...extractedFacts.numbers, ...extractNumbers(original)]))) return false;
  if (/\b(strengthened|enhanced|improved|delivered)\s+(added|built|collaborated|created|integrated|developed|improved|worked)\b/i.test(improved)) return false;
  return true;
}

export function cleanupOriginalDerivedText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const clean = cleanResumeLine(line);
      if (!clean) return "";
      return isBulletLine(line) ? `- ${clean}` : clean;
    })
    .join("\n")
    .replace(/\bfor\s+a\s+delivery\s+speed\s+and\s+user\s+experience\b/gi, "improving delivery speed and user experience")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isBulletLine(line: string) {
  return /^\s*(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*\S+/.test(line);
}

function safeOriginalResume(originalResumeText: string, reason: string) {
  console.warn(`[resume-safety] Falling back to original resume preview: ${reason}`);
  return cleanupOriginalDerivedText(originalResumeText).slice(0, 2400);
}

function allFactsAllowed(values: string[], allowed: string[], label: string) {
  const allowedKeys = new Set(allowed.map(factKey));
  for (const value of values) {
    if (!allowedKeys.has(factKey(value))) {
      console.warn(`[resume-safety] Rejected invented ${label}: ${value}`);
      return false;
    }
  }
  return true;
}

function isSubset(values: Set<string>, allowed: Set<string>) {
  for (const value of values) {
    if (!allowed.has(value)) return false;
  }
  return true;
}

function stripPunctuation(value: string) {
  return value.replace(/[^\w]+/g, "");
}
