export type ResumeFacts = {
  emails: string[];
  phones: string[];
  urls: string[];
  linkedinUrls: string[];
  githubUrls: string[];
  possibleLocations: string[];
  companyNames: string[];
  jobTitles: string[];
  dateRanges: string[];
  educationLines: string[];
  degreeLines: string[];
  certificationLines: string[];
  numbers: string[];
  normalizedOriginalText: string;
};

const workHeadings = new Set(["work experience", "professional experience", "experience"]);
const educationHeadings = new Set(["education"]);
const certificationHeadings = new Set(["certifications"]);
const otherHeadings = new Set(["summary", "professional summary", "skills", "technical skills", "projects", "selected projects", "relevant projects"]);

export function extractResumeFacts(originalResumeText: string): ResumeFacts {
  const lines = originalResumeText
    .split(/\r?\n/)
    .map((rawLine) => ({ rawLine, line: cleanResumeLine(rawLine), isBullet: isBulletLine(rawLine) }))
    .filter((item) => item.line);
  const emails = unique(matches(originalResumeText, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi));
  const urls = unique(matches(originalResumeText, /https?:\/\/\S+|(?:linkedin|github)\.com\/\S+|www\.\S+/gi));
  const phones = unique(matches(originalResumeText, /(?:\+?\d[\d\s().-]{7,}\d)/g));
  const linkedinUrls = urls.filter((url) => /linkedin\.com/i.test(url));
  const githubUrls = urls.filter((url) => /github\.com/i.test(url));
  const possibleLocations = extractHeaderLocations(lines.map((item) => item.line));
  const companyNames: string[] = [];
  const jobTitles: string[] = [];
  const dateRanges: string[] = [];
  const educationLines: string[] = [];
  const degreeLines: string[] = [];
  const certificationLines: string[] = [];
  let section: "work" | "education" | "certifications" | "" = "";

  for (const { line, isBullet } of lines) {
    const heading = normalizeFact(line).replace(/[:.-]+$/g, "");
    if (workHeadings.has(heading)) {
      section = "work";
      continue;
    }
    if (educationHeadings.has(heading)) {
      section = "education";
      continue;
    }
    if (certificationHeadings.has(heading)) {
      section = "certifications";
      continue;
    }
    if (otherHeadings.has(heading)) section = "";

    dateRanges.push(...extractDateRanges(line));
    if (section === "work" && !isBullet) {
      const parsed = parseWorkLine(line);
      if (parsed.title) jobTitles.push(parsed.title);
      if (parsed.company) companyNames.push(parsed.company);
    }
    if (section === "education" && !isBullet) {
      educationLines.push(line);
      degreeLines.push(line);
    }
    if (section === "certifications" && !isBullet) certificationLines.push(line);
  }

  return {
    emails: unique(emails),
    phones: unique(phones),
    urls: unique(urls),
    linkedinUrls: unique(linkedinUrls),
    githubUrls: unique(githubUrls),
    possibleLocations: unique(possibleLocations),
    companyNames: unique(companyNames),
    jobTitles: unique(jobTitles),
    dateRanges: unique(dateRanges),
    educationLines: unique(educationLines),
    degreeLines: unique(degreeLines),
    certificationLines: unique(certificationLines),
    numbers: unique(matches(originalResumeText, /\b\d+(?:[.,]\d+)?%?\b/g)),
    normalizedOriginalText: normalizeFact(originalResumeText)
  };
}

export function normalizeFact(value: string) {
  return value
    .toLowerCase()
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[\u2012-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function factKey(value: string) {
  return normalizeFact(value).replace(/[^a-z0-9@.+#/%-]+/g, "");
}

export function cleanResumeLine(value: string) {
  return value
    .replace(/^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractNumbers(text: string) {
  return unique(matches(text, /\b\d+(?:[.,]\d+)?%?\b/g));
}

function extractHeaderLocations(lines: string[]) {
  const headerLines = lines.slice(0, Math.min(4, lines.length));
  return headerLines
    .flatMap((line) => line.split(/\s+\|\s+|\s{2,}/))
    .map((part) => part.trim())
    .filter((part) => part && !/@|linkedin\.com|github\.com|https?:\/\/|www\.|\+?\d[\d\s().-]{7,}/i.test(part))
    .filter((part, index) => index > 0 || part.split(/\s+/).length > 2);
}

function parseWorkLine(line: string) {
  const clean = line.replace(/\b(19|20)\d{2}\b.*$/g, "").trim();
  const [title = "", companyWithLocation = ""] = clean.split(/\s+-\s+|\s+\|\s+/);
  const company = companyWithLocation.split(/\s+-\s+|\s+\|\s+/)[0]?.trim() ?? "";
  return { title: title.trim(), company };
}

function extractDateRanges(line: string) {
  return matches(line, /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?[a-z]*\.?\s*(?:19|20)\d{2}\s*(?:-|to|–|—)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?[a-z]*\.?\s*)?(?:present|(?:19|20)\d{2})\b|\b(?:19|20)\d{2}\s*(?:-|to|–|—)\s*(?:present|(?:19|20)\d{2})\b/gi);
}

function isBulletLine(line: string) {
  return /^\s*(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*\S+/.test(line);
}

function matches(value: string, pattern: RegExp) {
  return [...value.matchAll(pattern)].map((match) => match[0].trim()).filter(Boolean);
}

function unique(items: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of items) {
    const key = factKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item.trim());
  }
  return output;
}
