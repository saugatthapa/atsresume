import { AnalysisResult } from "@/lib/schema";
import { extractKeywords, extractRewriteableBullets, findOverlap, isStrongBullet, normalize, sanitizeKeywordList } from "@/lib/keywords";
import { extractResumeFacts } from "@/lib/resume-facts";
import { cleanupOriginalDerivedText, validateBulletSuggestionsAgainstSource, validateOptimizedResumeAgainstSource } from "@/lib/validate-optimized-resume";

function labelForScore(score: number): AnalysisResult["scoreLabel"] {
  if (score < 45) return "Poor";
  if (score < 65) return "Fair";
  if (score < 82) return "Good";
  return "Strong";
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function fallbackAnalyze(resumeText: string, jobDescription: string): AnalysisResult {
  const jobKeywords = extractKeywords(jobDescription, 34);
  const matchedKeywords = findOverlap(resumeText, jobKeywords);
  const missingKeywords = jobKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const allSkills = extractKeywords(`${resumeText}\n${jobDescription}`, 30);
  const skillsFound = findOverlap(resumeText, allSkills);
  const skillsMissing = missingKeywords.slice(0, 12);
  const bullets = extractRewriteableBullets(resumeText);
  const weakBullets = bullets.filter((line) => !isStrongBullet(line)).slice(0, 5);

  const keywordOverlap = percent(matchedKeywords.length, jobKeywords.length);
  const requiredSkills = percent(skillsFound.length, Math.max(skillsFound.length + skillsMissing.length, 1));
  const hasCoreFrontendMatch = inferTargetRole(jobDescription).toLowerCase().includes("frontend") && ["React", "Next.js", "TypeScript"].every((keyword) => matchedKeywords.includes(keyword));
  const titleRelevance = hasCoreFrontendMatch ? 92 : 70;
  const formatting = bullets.length > 2 ? 82 : 68;
  const bulletStrength = bullets.length === 0 ? 60 : percent(bullets.filter(isStrongBullet).length, bullets.length);
  const score = Math.max(
    28,
    Math.min(94, Math.round(keywordOverlap * 0.4 + requiredSkills * 0.25 + titleRelevance * 0.15 + formatting * 0.1 + bulletStrength * 0.1 + (hasCoreFrontendMatch ? 2 : 0)))
  );

  const targetRole = inferTargetRole(jobDescription);
  const improvedBullets =
    weakBullets.length > 0
      ? weakBullets.map((line) => ({
          original: line,
          problem: /\d/.test(line) ? "This bullet can be more specific about the role-relevant outcome." : "This bullet would be stronger with measurable impact.",
          improved: improveBullet(line, matchedKeywords)
        }))
      : [];

  const jobTailoredSummary = createProfessionalSummary(targetRole, matchedKeywords);

  return postProcessAnalysis(
    {
      score,
      scoreLabel: labelForScore(score),
      summary: `Your resume has an estimated ATS match score of ${score}/100. It already aligns with ${matchedKeywords.slice(0, 4).join(", ") || "several target role requirements"}, while the biggest opportunities are ${missingKeywords.slice(0, 5).join(", ") || "clearer role-specific keyword coverage"}.`,
      missingKeywords: missingKeywords.slice(0, 18),
      matchedKeywords: matchedKeywords.slice(0, 18),
      skillsFound: skillsFound.slice(0, 14),
      skillsMissing: skillsMissing.slice(0, 14),
      weakBulletPoints: improvedBullets,
      jobTailoredSummary,
      atsChecklist: [
        {
          item: "Keyword alignment",
          status: keywordOverlap > 65 ? "pass" : keywordOverlap > 40 ? "warning" : "fail",
          recommendation: "Add missing role-specific keywords only where they accurately describe your experience."
        },
        {
          item: "Readable formatting",
          status: formatting > 70 ? "pass" : "warning",
          recommendation: "Use standard headings, simple bullets, and avoid tables or graphics for ATS-heavy applications."
        },
        {
          item: "Impact bullets",
          status: bulletStrength > 70 ? "pass" : "warning",
          recommendation: "Lead bullets with action verbs and include metrics, scope, or outcomes where possible."
        },
        {
          item: "Honest skill coverage",
          status: skillsMissing.length < 5 ? "pass" : "warning",
          recommendation: "Separate true missing skills from adjacent experience you can credibly reframe."
        }
      ],
      optimizedResumePreview: resumeText.slice(0, 1800)
    },
    resumeText,
    jobDescription
  );
}

export function postProcessAnalysis(result: AnalysisResult, resumeText: string, jobDescription: string): AnalysisResult {
  const sourceFacts = extractResumeFacts(resumeText);
  const jobKeywords = extractKeywords(jobDescription, 34);
  const matchedKeywords = uniqueKeywords(findOverlap(resumeText, sanitizeKeywordList([...result.matchedKeywords, ...jobKeywords], 40)));
  const foundKeys = new Set(matchedKeywords.map(keywordKey));
  const missingKeywords = uniqueKeywords(sanitizeKeywordList([...result.missingKeywords, ...jobKeywords.filter((keyword) => !foundKeys.has(keywordKey(keyword)))], 18)).filter(
    (keyword) => !foundKeys.has(keywordKey(keyword))
  );
  const { normalizedMatchedKeywords, normalizedSkillsFound, normalizedSkillsMissing } = normalizeSkillCoverage({
    matchedKeywords,
    skillsFound: result.skillsFound,
    skillsMissing: result.skillsMissing,
    missingKeywords
  });
  const eligibleBullets = extractRewriteableBullets(resumeText);
  const eligibleClean = new Set(eligibleBullets.map((line) => normalize(line)));
  const targetRole = inferTargetRole(jobDescription);
  const filteredRewrites = result.weakBulletPoints
    .filter((item) => eligibleClean.has(normalize(item.original)))
    .slice(0, 5)
    .map((item) => ({
      original: cleanKnownBadPhrases(normalizeBulletText(item.original)),
      problem: item.problem || "This bullet can be stronger and more job-aligned.",
      improved: improveBullet(item.original, normalizedMatchedKeywords)
    }));

  const candidateWeakBulletPoints =
    filteredRewrites.length > 0
      ? filteredRewrites
      : eligibleBullets
          .filter((line) => !isStrongBullet(line))
          .slice(0, 5)
          .map((line) => ({
            original: cleanKnownBadPhrases(line),
            problem: /\d/.test(line) ? "This bullet can be more specific about the role-relevant outcome." : "This bullet would be stronger with measurable impact.",
            improved: improveBullet(line, normalizedMatchedKeywords)
          }));
  const weakBulletPoints = validateBulletSuggestionsAgainstSource(candidateWeakBulletPoints, resumeText, sourceFacts);
  // Optimized resume preview is derived from the original resume and then validated before it is saved, displayed, or exported to PDF.
  const optimizedResumePreview = validateOptimizedResumeAgainstSource(buildOptimizedResumePreview(resumeText, weakBulletPoints), resumeText, sourceFacts);

  return {
    ...result,
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    scoreLabel: labelForScore(result.score),
    missingKeywords,
    matchedKeywords: normalizedMatchedKeywords,
    skillsFound: normalizedSkillsFound,
    skillsMissing: normalizedSkillsMissing,
    weakBulletPoints,
    jobTailoredSummary: looksLikeKeywordList(result.jobTailoredSummary) ? createProfessionalSummary(targetRole, normalizedMatchedKeywords) : result.jobTailoredSummary,
    optimizedResumePreview
  };
}

function improveBullet(line: string, matchedKeywords: string[]) {
  const original = normalizeBulletText(line);
  const cleanLine = original
    .replace(/^responsible for\s+/i, "")
    .replace(/^worked on\s+/i, "")
    .replace(/^(strengthened|improved|enhanced)\s+(?=(added|built|collaborated|created|delivered|designed|developed|improved|integrated|launched|led|optimized|partnered|shipped|worked)\b)/i, "")
    .replace(/\bfor\s+a\s+delivery\s+speed\s+and\s+user\s+experience\b/gi, "improving delivery speed and user experience")
    .replace(/[.]\s*$/g, "")
    .trim();
  const natural = naturalizeBullet(cleanLine || original, matchedKeywords);
  return `${natural.replace(/[.]\s*$/g, "")}.`;
}

function createProfessionalSummary(targetRole: string, matchedKeywords: string[]) {
  const strengths = matchedKeywords.slice(0, 4).join(", ") || "modern web development, clean implementation, and cross-functional delivery";
  return `Frontend-focused professional targeting ${articleFor(targetRole)} ${targetRole} role, with hands-on experience in ${strengths}. Brings a practical mix of implementation quality, responsive UI thinking, API integration, and performance-minded delivery to help teams ship faster, more reliable product experiences.`;
}

function inferTargetRole(jobDescription: string) {
  const clean = normalize(jobDescription);
  const match = clean.match(/(?:hiring|seeking|looking for|role for|position for)\s+(?:an?\s+)?([a-z\s]+?(?:developer|engineer|designer|analyst|manager|specialist))/);
  if (match?.[1]) return titleCase(match[1].replace(/\s+/g, " ").trim());
  if (clean.includes("frontend") || clean.includes("front end")) return "Frontend Developer";
  if (clean.includes("software engineer")) return "Software Engineer";
  if (clean.includes("data analyst")) return "Data Analyst";
  return "Target Role";
}

function looksLikeKeywordList(value: string) {
  return value.includes("|") || value.split(",").length > 4 || value.trim().split(/\s+/).length < 8;
}

function articleFor(role: string) {
  return /^[aeiou]/i.test(role) ? "an" : "a";
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function uniqueKeywords(items: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const key = keywordKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function normalizeSkillCoverage({
  matchedKeywords,
  skillsFound,
  skillsMissing,
  missingKeywords
}: {
  matchedKeywords: string[];
  skillsFound: string[];
  skillsMissing: string[];
  missingKeywords: string[];
}) {
  const normalizedMatchedKeywords = uniqueKeywords(sanitizeKeywordList(matchedKeywords, 18));
  const normalizedSkillsFound = uniqueKeywords(sanitizeKeywordList([...skillsFound, ...normalizedMatchedKeywords], 18));
  const foundKeys = new Set([...normalizedMatchedKeywords, ...normalizedSkillsFound].map(keywordKey));
  const normalizedSkillsMissing = uniqueKeywords(sanitizeKeywordList([...skillsMissing, ...missingKeywords], 18)).filter((keyword) => !foundKeys.has(keywordKey(keyword)));

  return {
    normalizedMatchedKeywords,
    normalizedSkillsFound,
    normalizedSkillsMissing
  };
}

function buildOptimizedResumePreview(resumeText: string, rewrites: AnalysisResult["weakBulletPoints"]) {
  const rewriteByOriginal = new Map(rewrites.map((item) => [normalize(normalizeBulletText(item.original)), item.improved]));
  return resumeText
    .split(/\r?\n/)
    .map((line) => {
      const bullet = normalizeBulletText(line);
      const rewrite = rewriteByOriginal.get(normalize(cleanKnownBadPhrases(bullet)));
      if (!rewrite) return line;
      const indent = line.match(/^\s*/)?.[0] ?? "";
      return `${indent}- ${normalizeBulletText(rewrite)}`;
    })
    .join("\n")
    .slice(0, 2400);
}

function naturalizeBullet(value: string, matchedKeywords: string[]) {
  let clean = value
    .replace(/\bfor\s+a\s+delivery\s+speed\s+and\s+user\s+experience\b/gi, "improving delivery speed and user experience")
    .replace(/\bdesign and product\b/gi, "product and design")
    .replace(/\bcandidate review workflows\b/gi, "candidate review workflows")
    .trim();

  if (/^partnered with product and design\b/i.test(clean) || /^partnered with design and product\b/i.test(clean)) {
    clean = clean.replace(/^partnered with (?:product and design|design and product)/i, "Collaborated with product and design teams");
  } else if (/^collaborated with product and design\b/i.test(clean) || /^collaborated with design and product\b/i.test(clean)) {
    clean = clean.replace(/^collaborated with (?:product and design|design and product)/i, "Collaborated with product and design teams");
  } else if (/^built\b/i.test(clean)) {
    clean = clean.replace(/^built\b/i, "Built");
  } else if (/^created\b/i.test(clean)) {
    clean = clean.replace(/^created\b/i, "Created");
  } else if (/^integrated\b/i.test(clean)) {
    clean = clean.replace(/^integrated\b/i, "Integrated");
  } else if (/^improved\b/i.test(clean)) {
    clean = clean.replace(/^improved\b/i, "Improved");
  } else if (/^worked\b/i.test(clean)) {
    clean = clean.replace(/^worked\b/i, "Worked");
  } else if (/^added\b/i.test(clean)) {
    clean = clean.replace(/^added\b/i, "Added");
  } else if (/^debugged\b/i.test(clean)) {
    clean = clean.replace(/^debugged\b/i, "Debugged");
  } else if (!startsWithActionVerb(clean)) {
    clean = `Delivered ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
  }

  clean = clean
    .replace(/\bteams teams\b/gi, "teams")
    .replace(/\bto release responsive landing pages(?! aligned with business goals)\b/i, "to release responsive landing pages aligned with business goals")
    .replace(/\baligned with business goals aligned with business goals\b/gi, "aligned with business goals")
    .replace(/\b(TypeScript|JavaScript|React|Next\.js) improving\b/g, "$1, improving")
    .replace(/\bfor\s+delivery\s+speed\s+and\s+user\s+experience\b/gi, "improving delivery speed and user experience")
    .replace(/\bfor\s+a\s+delivery\s+speed\s+and\s+user\s+experience\b/gi, "improving delivery speed and user experience")
    .replace(/\s+/g, " ")
    .trim();

  if (!mentionsAnySkill(clean, matchedKeywords) && /\b(built|created|developed|integrated)\b/i.test(clean)) {
    const skill = matchedKeywords[0];
    if (skill) clean = `${clean} using ${skill}`;
  }

  return clean;
}

function cleanKnownBadPhrases(value: string) {
  return cleanupOriginalDerivedText(value);
}

function startsWithActionVerb(value: string) {
  return /^(added|built|collaborated|created|delivered|designed|developed|debugged|improved|integrated|launched|led|optimized|partnered|released|shipped|worked)\b/i.test(value);
}

function mentionsAnySkill(value: string, matchedKeywords: string[]) {
  return matchedKeywords.some((keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(value));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordKey(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9+#]+/g, "")
    .trim();
}

function normalizeBulletText(value: string) {
  return value.replace(/^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2)\s*/, "").trim();
}
