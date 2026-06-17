const genericWords = new Set([
  "ability",
  "about",
  "across",
  "application",
  "applications",
  "apis",
  "architecture",
  "build",
  "candidate",
  "clean",
  "closely",
  "collaborate",
  "collaboration",
  "company",
  "degree",
  "design",
  "environment",
  "experience",
  "frontend",
  "including",
  "looking",
  "preferred",
  "product",
  "qualification",
  "qualifications",
  "requirements",
  "responsibilities",
  "responsible",
  "responsive",
  "strong",
  "their",
  "using",
  "within",
  "work",
  "working",
  "years"
]);

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "into",
  "is",
  "it",
  "job",
  "of",
  "on",
  "or",
  "our",
  "role",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "we",
  "will",
  "with",
  "you",
  "your",
  ...genericWords
]);

const canonicalTerms: Array<{ label: string; aliases: string[] }> = [
  { label: "React", aliases: ["react", "react.js", "reactjs"] },
  { label: "Next.js", aliases: ["next.js", "nextjs", "next js"] },
  { label: "TypeScript", aliases: ["typescript", "ts"] },
  { label: "JavaScript", aliases: ["javascript", "js"] },
  { label: "Tailwind CSS", aliases: ["tailwind css", "tailwind"] },
  { label: "REST APIs", aliases: ["rest api", "rest apis", "restful api", "restful apis"] },
  { label: "SEO", aliases: ["seo", "search engine optimization"] },
  { label: "Core Web Vitals", aliases: ["core web vitals", "lighthouse"] },
  { label: "GitHub", aliases: ["github", "git hub"] },
  { label: "Git", aliases: ["git"] },
  { label: "Responsive design", aliases: ["responsive design", "responsive ui", "mobile responsive", "responsive layouts", "responsive interfaces", "desktop and mobile"] },
  { label: "Performance optimization", aliases: ["performance optimization", "page speed", "web performance", "performance", "load time", "core web vitals", "optimizing api calls", "reducing unused client javascript"] },
  { label: "Prisma", aliases: ["prisma"] },
  { label: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { label: "Vercel", aliases: ["vercel"] },
  { label: "Node.js", aliases: ["node.js", "nodejs", "node js"] },
  { label: "HTML", aliases: ["html", "html5"] },
  { label: "CSS", aliases: ["css", "css3"] },
  { label: "Accessibility", aliases: ["accessibility", "a11y", "wcag"] },
  { label: "UI components", aliases: ["ui components", "component library", "design system", "components"] },
  { label: "API integration", aliases: ["api integration", "third-party api", "integrations", "api calls", "integrated rest apis"] },
  { label: "Testing", aliases: ["testing", "unit tests", "integration tests", "playwright", "jest", "vitest"] },
  { label: "CI/CD", aliases: ["ci/cd", "ci cd", "continuous integration"] },
  { label: "Docker", aliases: ["docker"] },
  { label: "AWS", aliases: ["aws", "amazon web services"] },
  { label: "SQL", aliases: ["sql"] },
  { label: "Analytics", aliases: ["analytics", "google analytics"] },
  { label: "A/B testing", aliases: ["a/b testing", "ab testing", "experimentation"] },
  { label: "Stakeholder management", aliases: ["stakeholder management", "stakeholders"] },
  { label: "Project management", aliases: ["project management"] }
];

const actionVerbs = ["built", "created", "delivered", "designed", "developed", "improved", "increased", "integrated", "launched", "led", "optimized", "partnered", "reduced", "shipped"];

export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanKeyword(keyword: string) {
  const cleaned = normalize(keyword)
    .replace(/^[^a-z0-9+#]+|[^a-z0-9+#.]+$/g, "")
    .replace(/\.+$/g, "")
    .trim();
  if (!cleaned || cleaned.length < 2 || stopWords.has(cleaned) || /^\d+$/.test(cleaned)) return "";
  return cleaned;
}

export function canonicalizeKeyword(keyword: string) {
  const cleaned = cleanKeyword(keyword);
  if (!cleaned) return "";
  const match = canonicalTerms.find((term) => term.aliases.some((alias) => cleaned === alias || cleaned.includes(alias)));
  return match?.label ?? toTitleCase(cleaned);
}

export function extractKeywords(text: string, limit = 24) {
  const clean = normalize(text);
  const terms = canonicalTerms.filter((term) => term.aliases.some((alias) => phraseExists(clean, alias))).map((term) => term.label);
  return rankKeywords(terms).slice(0, limit);
}

export function sanitizeKeywordList(items: string[], limit = 24) {
  return rankKeywords(items.map(canonicalizeKeyword).filter(Boolean)).slice(0, limit);
}

export function findOverlap(source: string, targets: string[]) {
  const clean = normalize(source);
  return sanitizeKeywordList(targets).filter((keyword) => keywordMatches(clean, keyword));
}

export function splitResumeLines(resumeText: string) {
  return resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 160);
}

export function extractRewriteableBullets(resumeText: string) {
  const lines = splitResumeLines(resumeText);
  const bullets: string[] = [];
  let inRelevantSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = normalize(line).replace(/[:.-]+$/g, "");
    if (isSectionHeading(line)) {
      inRelevantSection = ["work experience", "professional experience", "experience", "projects", "selected projects", "relevant projects"].includes(heading);
      continue;
    }
    if (inRelevantSection && isBulletLine(line) && !isNonResumeBullet(line)) bullets.push(stripBullet(line));
  }

  return bullets.slice(0, 12);
}

export function isStrongBullet(line: string) {
  const clean = normalize(line);
  return /\d/.test(line) && actionVerbs.some((verb) => clean.includes(verb));
}

function rankKeywords(items: string[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.trim();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || priorityScore(b[0]) - priorityScore(a[0]) || a[0].localeCompare(b[0]))
    .map(([item]) => item);
}

function priorityScore(item: string) {
  const index = canonicalTerms.findIndex((term) => term.label === item);
  return index === -1 ? 0 : canonicalTerms.length - index;
}

function keywordMatches(cleanSource: string, keyword: string) {
  const term = canonicalTerms.find((item) => item.label === keyword);
  const aliases = term?.aliases ?? [keyword.toLowerCase()];
  return aliases.some((alias) => phraseExists(cleanSource, alias));
}

function phraseExists(cleanSource: string, phrase: string) {
  const cleanPhrase = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${cleanPhrase}(\\s|$)`).test(cleanSource);
}

function isBulletLine(line: string) {
  return /^(\s*(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2))\s*\S+/.test(line);
}

function stripBullet(line: string) {
  return line.replace(/^(\s*(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2))\s*/, "").trim();
}

function isSectionHeading(line: string) {
  if (isBulletLine(line) || line.length > 40) return false;
  const clean = normalize(line).replace(/[:.-]+$/g, "");
  return ["summary", "professional summary", "skills", "technical skills", "work experience", "professional experience", "experience", "projects", "selected projects", "relevant projects", "education", "certifications"].includes(clean);
}

function isNonResumeBullet(line: string) {
  const stripped = stripBullet(line);
  const clean = normalize(stripped);
  return (
    stripped.length < 40 ||
    /@/.test(stripped) ||
    /(linkedin\.com|github\.com|https?:\/\/|www\.)/i.test(stripped) ||
    /(\+?\d[\d\s().-]{7,})/.test(stripped) ||
    isCommaSeparatedSkillsList(stripped) ||
    /^[a-z\s]+,\s*[a-z]{2,}$/i.test(stripped) ||
    /^(skills|technical skills|education|certifications)$/i.test(stripped) ||
    /^\d{4}\s*(-|\u2013|to)\s*(\d{4}|present)$/i.test(stripped) ||
    clean.split(/\s+/).length < 5
  );
}

function isCommaSeparatedSkillsList(line: string) {
  const parts = line.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 4) return false;
  const shortParts = parts.filter((part) => part.split(/\s+/).length <= 3).length;
  return shortParts / parts.length > 0.75;
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
