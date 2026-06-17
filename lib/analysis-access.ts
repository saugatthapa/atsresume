import type { AnalysisResult } from "@/lib/schema";

export function getFreePreviewAnalysis(analysis: AnalysisResult): AnalysisResult {
  const optimizedResumePreview = getLimitedResumePreview(analysis.optimizedResumePreview);
  const allowedPreviewText = textKey(optimizedResumePreview);

  return {
    ...analysis,
    missingKeywords: analysis.missingKeywords.slice(0, 3),
    matchedKeywords: analysis.matchedKeywords.slice(0, 5),
    skillsFound: analysis.skillsFound.slice(0, 5),
    skillsMissing: analysis.skillsMissing.slice(0, 3),
    weakBulletPoints: analysis.weakBulletPoints.filter((item) => allowedPreviewText.includes(textKey(item.original))).slice(0, 1),
    jobTailoredSummary: "",
    atsChecklist: [],
    optimizedResumePreview
  };
}

export function getPaidAnalysis(analysis: AnalysisResult): AnalysisResult {
  return analysis;
}

type PreviewItem = { type: "paragraph" | "bullet"; text: string };
type PreviewSection = { title: string; items: PreviewItem[] };

const sectionTitles = new Map([
  ["summary", "Professional Summary"],
  ["professional summary", "Professional Summary"],
  ["targeted professional summary", "Professional Summary"],
  ["skills", "Core Skills"],
  ["technical skills", "Core Skills"],
  ["core skills", "Core Skills"],
  ["work experience", "Work Experience"],
  ["professional experience", "Work Experience"],
  ["experience", "Work Experience"],
  ["projects", "Projects"],
  ["selected projects", "Projects"],
  ["relevant projects", "Projects"],
  ["education", "Education"],
  ["certifications", "Certifications"]
]);

export function getLimitedResumePreview(value: string) {
  const parsed = parseResumePreview(value);
  const lines: string[] = [];
  if (parsed.name) lines.push(parsed.name);
  if (parsed.contact.length > 0) lines.push(parsed.contact.join(" | "));

  const summary = parsed.sections.find((section) => section.title === "Professional Summary");
  const skills = parsed.sections.find((section) => section.title === "Core Skills");
  const work = parsed.sections.find((section) => section.title === "Work Experience");

  appendSection(lines, summary);
  appendSection(lines, skills);

  if (work) {
    const limitedWork = limitWorkExperience(work);
    if (limitedWork.items.length > 0) appendSection(lines, limitedWork);
  }

  return lines.join("\n");
}

function appendSection(lines: string[], section?: PreviewSection) {
  if (!section || section.items.length === 0) return;
  lines.push("", section.title);
  for (const item of section.items) {
    lines.push(item.type === "bullet" ? `- ${stripBulletMarker(item.text)}` : item.text);
  }
}

function limitWorkExperience(section: PreviewSection): PreviewSection {
  const items: PreviewItem[] = [];
  let bulletCount = 0;

  for (const item of section.items) {
    if (item.type === "bullet") {
      if (bulletCount >= 2) break;
      items.push(item);
      bulletCount += 1;
      continue;
    }

    if (bulletCount > 0) break;
    if (items.some((existing) => existing.type === "paragraph")) break;
    items.push(item);
  }

  return { title: "Work Experience", items };
}

function parseResumePreview(value: string) {
  const lines = cleanText(value)
    .replace(/\nTargeted professional summary:[\s\S]*$/i, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines.find((line) => !detectSectionTitle(line) && !isContactDetailLine(line) && !isBulletLine(line)) ?? "";
  const nameIndex = name ? lines.indexOf(name) : -1;
  const contact: string[] = [];
  const sections: PreviewSection[] = [];
  let current: PreviewSection | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index === nameIndex) continue;
    const title = detectSectionTitle(line);
    if (title) {
      current = { title, items: [] };
      sections.push(current);
      continue;
    }
    if (isContactDetailLine(line)) {
      contact.push(...splitContactLine(line));
      continue;
    }
    if (!current) {
      current = { title: "Professional Summary", items: [] };
      sections.push(current);
    }
    current.items.push({ type: isBulletLine(line) ? "bullet" : "paragraph", text: stripBulletMarker(line) });
  }

  return {
    name,
    contact: orderContactItems(Array.from(new Set(contact))).slice(0, 8),
    sections: normalizeSections(sections)
  };
}

function normalizeSections(sections: PreviewSection[]) {
  const order = ["Professional Summary", "Core Skills", "Work Experience", "Projects", "Education", "Certifications"];
  const merged = new Map<string, PreviewSection>();

  for (const section of sections) {
    const title = normalizeSectionTitle(section.title);
    const items = section.items.filter((item) => item.text.trim());
    if (!title || items.length === 0) continue;
    const existing = merged.get(title);
    if (existing) {
      existing.items.push(...items);
    } else {
      merged.set(title, { title, items: [...items] });
    }
  }

  return [...merged.values()].sort((a, b) => sectionOrder(a.title, order) - sectionOrder(b.title, order));
}

function normalizeSectionTitle(title: string) {
  const key = title.toLowerCase().replace(/[:.-]+$/g, "").replace(/\s+/g, " ").trim();
  if (["summary", "professional summary", "targeted professional summary"].includes(key)) return "Professional Summary";
  if (["skills", "technical skills", "core skills"].includes(key)) return "Core Skills";
  if (["work experience", "professional experience", "experience"].includes(key)) return "Work Experience";
  if (["projects", "selected projects", "relevant projects"].includes(key)) return "Projects";
  if (key === "education") return "Education";
  if (key === "certifications") return "Certifications";
  return title.trim();
}

function sectionOrder(title: string, order: string[]) {
  const index = order.indexOf(title);
  return index === -1 ? order.length : index;
}

function cleanText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/gi, (_match, label: string, email: string) => {
      const decoded = decodeURIComponent(email).replace(/^mailto:/i, "").split("?")[0].trim();
      return decoded.includes("@") ? decoded : label;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^(?:\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2)\s*/gm, "- ")
    .replace(/^[\u25A1\u25A0\u25AA]\s*/gm, "- ")
    .replace(/[*_`#>]+/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectSectionTitle(line: string) {
  const key = line.toLowerCase().replace(/[:.-]+$/g, "").replace(/\s+/g, " ").trim();
  return sectionTitles.get(key) ?? "";
}

function isContactLine(line: string) {
  return /@|linkedin\.com|github\.com|https?:\/\/|www\./i.test(line) || hasPhoneNumber(line);
}

function isContactDetailLine(line: string) {
  return isContactLine(line) || isStandaloneLocationLine(line);
}

function isStandaloneLocationLine(line: string) {
  return /^(?:remote|hybrid|[A-Za-z .'-]+,\s*[A-Za-z .'-]+)$/.test(line.trim());
}

function splitContactLine(line: string) {
  return line
    .split(/\s+[|\u2022]\s+|\s{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^mailto:/i, ""));
}

function orderContactItems(items: string[]) {
  return [...items].sort((a, b) => contactOrder(a) - contactOrder(b));
}

function contactOrder(item: string) {
  if (isStandaloneLocationLine(item)) return 0;
  if (/@/.test(item)) return 1;
  if (/linkedin\.com/i.test(item)) return 2;
  if (/github\.com/i.test(item)) return 3;
  return 4;
}

function isBulletLine(line: string) {
  return /^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2)\s*\S+/.test(line);
}

function stripBulletMarker(line: string) {
  return line.replace(/^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2)\s*/, "").trim();
}

function textKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9+#]+/g, "");
}

function hasPhoneNumber(line: string) {
  const digitCount = (line.match(/\d/g) ?? []).length;
  return digitCount >= 9 && /(?:\+\d|\(\d{2,}\)|\d{3}[\s.-]\d{3})/.test(line);
}
