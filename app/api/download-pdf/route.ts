import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { analysisSchema, AnalysisResult } from "@/lib/schema";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { footerWatermark, freeWatermark } from "@/lib/watermark";

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const contentWidth = pageWidth - margin * 2;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  await ensureDatabase();
  const record = await prisma.analysis.findUnique({ where: { token } });
  if (!record) return NextResponse.json({ error: "Result not found" }, { status: 404 });
  if (!record.paidStatus) {
    return NextResponse.json({ error: "payment_required", message: "Unlock downloads to export your optimized resume." }, { status: 402 });
  }
  const parsed = analysisSchema.safeParse(record.analysisJson);
  if (!parsed.success) return NextResponse.json({ error: "Invalid result" }, { status: 500 });

  const pdf = buildReportPdf(parsed.data, true);
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ats-report-jobresumematch.pdf"'
    }
  });
}

function buildReportPdf(result: AnalysisResult, isPaid: boolean) {
  const safeResult = normalizePdfResult(result);
  const doc = new jsPDF({ unit: "pt", format: "letter", compress: false });
  let y = margin;

  if (!isPaid) drawWatermark(doc, false);
  drawReportHeader(doc, safeResult);
  y = 146;

  y = addSection(doc, y, "ATS Match Summary", [safeResult.summary], isPaid);
  y = addKeywordSection(doc, y, "Missing Keywords", safeResult.missingKeywords, isPaid);
  y = addKeywordSection(doc, y, "Matched Keywords", safeResult.matchedKeywords, isPaid);
  y = addKeywordSection(doc, y, "Skills Found", safeResult.skillsFound, isPaid);
  y = addKeywordSection(doc, y, "Skills Missing", safeResult.skillsMissing, isPaid);
  y = addSection(doc, y, "Job-Tailored Summary", [safeResult.jobTailoredSummary], isPaid);
  addBulletSuggestions(doc, y, safeResult, isPaid);

  doc.addPage();
  if (!isPaid) drawWatermark(doc, false);
  addOptimizedResumePreview(doc, safeResult.optimizedResumePreview, isPaid);

  addFooter(doc, isPaid);
  return Buffer.from(doc.output("arraybuffer"));
}

function drawReportHeader(doc: jsPDF, result: AnalysisResult) {
  doc.setFillColor(11, 18, 32);
  doc.roundedRect(margin, margin, contentWidth, 70, 12, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  writeText(doc, "JobResumeMatch ATS Report", margin + 22, margin + 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  writeText(doc, "Estimated resume-to-job match score", margin + 22, margin + 52);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  writeText(doc, `${result.score}/100`, pageWidth - margin - 112, margin + 34);
  doc.setFontSize(10);
  writeText(doc, `${result.scoreLabel} match`, pageWidth - margin - 112, margin + 54);
  doc.setTextColor(11, 18, 32);
}

function addSection(doc: jsPDF, y: number, title: string, paragraphs: string[], isPaid: boolean) {
  y = ensureSpace(doc, y, 86, isPaid);
  y = addHeading(doc, y, title);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);

  for (const paragraph of paragraphs) {
    const chunks = paragraph.split(/\n{2,}/);
    for (const chunk of chunks) {
      const lines = splitPdfText(doc, chunk, contentWidth);
      for (const line of lines) {
        y = ensureSpace(doc, y, 28, isPaid);
        writeText(doc, line, margin, y);
        y += 15;
      }
      y += 6;
    }
  }
  return y + 8;
}

function addKeywordSection(doc: jsPDF, y: number, title: string, keywords: string[], isPaid: boolean) {
  y = ensureSpace(doc, y, 72, isPaid);
  y = addHeading(doc, y, title);
  if (keywords.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    writeText(doc, title === "Skills Missing" ? "No major missing skills found." : "No major gaps found in this section.", margin, y);
    return y + 24;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  let x = margin;
  for (const keyword of keywords.slice(0, 18)) {
    const label = cleanPdfText(keyword);
    const width = Math.min(doc.getTextWidth(label) + 20, contentWidth);
    if (x + width > pageWidth - margin) {
      x = margin;
      y += 28;
      y = ensureSpace(doc, y, 38, isPaid);
    }
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 209, 234);
    doc.roundedRect(x, y - 14, width, 22, 8, 8, "FD");
    doc.setTextColor(37, 99, 235);
    writeText(doc, label, x + 10, y);
    x += width + 8;
  }
  return y + 34;
}

function addBulletSuggestions(doc: jsPDF, y: number, result: AnalysisResult, isPaid: boolean) {
  if (result.weakBulletPoints.length < 2) return y;

  y = ensureSpace(doc, y, 94, isPaid);
  y = addHeading(doc, y, "Improved Bullet Suggestions");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  for (const item of result.weakBulletPoints.slice(0, 6)) {
    y = ensureSpace(doc, y, 92, isPaid);
    y = addSmallLabel(doc, y, "Original");
    y = addWrappedText(doc, y, item.original, 12, isPaid);
    y = addSmallLabel(doc, y + 2, "Suggestion");
    y = addWrappedText(doc, y, item.improved, 12, isPaid);
    y += 10;
  }
  return y + 4;
}

function addHeading(doc: jsPDF, y: number, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(11, 18, 32);
  writeText(doc, title, margin, y);
  doc.setDrawColor(219, 231, 245);
  doc.line(margin, y + 8, pageWidth - margin, y + 8);
  return y + 26;
}

function addSmallLabel(doc: jsPDF, y: number, label: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  writeText(doc, label, margin, y);
  return y + 13;
}

function addWrappedText(doc: jsPDF, y: number, text: string, lineHeight: number, isPaid: boolean) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const lines = splitPdfText(doc, text, contentWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, 22, isPaid);
    writeText(doc, line, margin, y);
    y += lineHeight;
  }
  return y;
}

function addOptimizedResumePreview(doc: jsPDF, resumeText: string, isPaid: boolean) {
  const preview = parseResumePreview(resumeText);
  let y = margin;
  y = addHeading(doc, y, "Optimized Resume Preview");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  if (preview.name) {
    writeText(doc, preview.name, pageWidth / 2, y, { align: "center" });
    y += 18;
  }

  if (preview.contact.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const contactLines = splitPdfText(doc, preview.contact.join("   "), contentWidth - 70);
    for (const line of contactLines) {
      writeText(doc, line, pageWidth / 2, y, { align: "center" });
      y += 11;
    }
  }

  y += 8;
  for (const section of preview.sections) {
    y = ensureSpace(doc, y, 70, isPaid);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    writeText(doc, section.title, margin, y);
    doc.setDrawColor(219, 228, 240);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    for (const item of section.items) {
      if (item.type === "bullet") {
        y = addResumeBullet(doc, y, item.text, isPaid);
      } else {
        const isRole = /\b(19|20)\d{2}\b/.test(item.text) && /[-|]/.test(item.text);
        doc.setFont("helvetica", isRole ? "bold" : "normal");
        const lines = splitPdfText(doc, item.text, contentWidth);
        for (const line of lines) {
          y = ensureSpace(doc, y, 24, isPaid);
          writeText(doc, line, margin, y);
          y += 13;
        }
        y += 2;
      }
    }
    y += 8;
  }
}

function addResumeBullet(doc: jsPDF, y: number, text: string, isPaid: boolean) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const lines = splitPdfText(doc, normalizePdfBullet(text).replace(/^- /, ""), contentWidth - 18);
  for (let index = 0; index < lines.length; index += 1) {
    y = ensureSpace(doc, y, 24, isPaid);
    writeText(doc, index === 0 ? `- ${lines[index]}` : lines[index], index === 0 ? margin : margin + 14, y);
    y += 13;
  }
  return y + 2;
}

function ensureSpace(doc: jsPDF, y: number, required: number, isPaid: boolean) {
  if (y + required < pageHeight - 58) return y;
  doc.addPage();
  if (!isPaid) drawWatermark(doc, false);
  return margin;
}

function drawWatermark(doc: jsPDF, includeFooter: boolean) {
  const stateFactory = doc.GState as unknown as new (args: { opacity: number }) => unknown;
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setGState(new stateFactory({ opacity: 0.055 }));
  writeText(doc, freeWatermark, 96, 458, { angle: -28 });
  doc.setGState(new stateFactory({ opacity: 1 }));
  doc.setTextColor(11, 18, 32);
  if (includeFooter) addFooter(doc, false);
}

function addFooter(doc: jsPDF, isPaid: boolean) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 42, pageWidth - margin, pageHeight - 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    writeText(doc, isPaid ? "Clean export - JobResumeMatch.com" : footerWatermark, margin, pageHeight - 24);
    writeText(doc, `Page ${i} of ${pages}`, pageWidth - margin - 48, pageHeight - 24);
  }
}

type ResumePreview = {
  name: string;
  contact: string[];
  sections: Array<{ title: string; items: Array<{ type: "paragraph" | "bullet"; text: string }> }>;
};

const resumeSectionTitles = new Map([
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

function parseResumePreview(value: string): ResumePreview {
  const lines = cleanPdfText(value)
    .replace(/\nTargeted professional summary:[\s\S]*$/i, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines.find((line) => !detectResumeSectionTitle(line) && !isContactDetailLine(line) && !isPdfBulletLine(line)) ?? "";
  const nameIndex = name ? lines.indexOf(name) : -1;
  const contact: string[] = [];
  const sections: ResumePreview["sections"] = [];
  let current: ResumePreview["sections"][number] | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index === nameIndex) continue;
    const title = detectResumeSectionTitle(line);
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
    current.items.push({ type: isPdfBulletLine(line) ? "bullet" : "paragraph", text: stripPdfBulletMarker(line) });
  }

  return {
    name,
    contact: orderContactItems(Array.from(new Set(contact))).slice(0, 8),
    sections: normalizeResumeSections(sections)
  };
}

function normalizeResumeSections(sections: ResumePreview["sections"]) {
  const order = ["Professional Summary", "Core Skills", "Work Experience", "Projects", "Education", "Certifications"];
  const merged = new Map<string, ResumePreview["sections"][number]>();

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

function cleanPdfText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/gi, (_match, label: string, email: string) => {
      const decoded = decodeURIComponent(email).replace(/^mailto:/i, "").split("?")[0].trim();
      return decoded.includes("@") ? decoded : label;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^(?:[-*]\s*|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[\u2022\u2023\u25A1\u25A0\u25AA]|[?\uFFFD]{1,4})\s*/gm, "- ")
    .replace(/(?:\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[\u25A1\u25A0\u25AA])/g, "")
    .replace(/[*_`#>]+/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizePdfResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    summary: cleanPdfText(result.summary),
    missingKeywords: result.missingKeywords.map(cleanPdfText).filter(Boolean),
    matchedKeywords: result.matchedKeywords.map(cleanPdfText).filter(Boolean),
    skillsFound: result.skillsFound.map(cleanPdfText).filter(Boolean),
    skillsMissing: normalizePdfSkillsMissing(result),
    weakBulletPoints: result.weakBulletPoints
      .map((item) => ({
        original: normalizePdfBullet(item.original),
        problem: cleanPdfText(item.problem),
        improved: normalizePdfBullet(item.improved)
      }))
      .filter((item) => item.original && item.improved),
    jobTailoredSummary: cleanPdfText(result.jobTailoredSummary),
    optimizedResumePreview: cleanPdfText(result.optimizedResumePreview)
  };
}

function normalizePdfSkillsMissing(result: AnalysisResult) {
  const found = new Set([...result.matchedKeywords, ...result.skillsFound].map(skillKey));
  return result.skillsMissing.map(cleanPdfText).filter((skill) => skill && !found.has(skillKey(skill)));
}

function skillKey(value: string) {
  return cleanPdfText(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, "")
    .trim();
}

function normalizePdfBullet(value: string) {
  const clean = cleanPdfText(value).replace(/^(?:[-*]\s*)+/, "").trim();
  return clean ? `- ${clean}` : "";
}

function splitPdfText(doc: jsPDF, text: string, width: number) {
  return doc.splitTextToSize(cleanPdfText(text), width) as string[];
}

function writeText(doc: jsPDF, text: string, x: number, y: number, options?: Parameters<jsPDF["text"]>[3]) {
  doc.text(cleanPdfText(text), x, y, options);
}

function detectResumeSectionTitle(line: string) {
  const key = line.toLowerCase().replace(/[:.-]+$/g, "").replace(/\s+/g, " ").trim();
  return resumeSectionTitles.get(key) ?? "";
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
    .split(/\s+[|\u2022-]\s+|\s{2,}/)
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

function isPdfBulletLine(line: string) {
  return /^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*\S+/.test(line);
}

function stripPdfBulletMarker(line: string) {
  return line.replace(/^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*/, "").trim();
}

function hasPhoneNumber(line: string) {
  const digitCount = (line.match(/\d/g) ?? []).length;
  return digitCount >= 9 && /(?:\+\d|\(\d{2,}\)|\d{3}[\s.-]\d{3})/.test(line);
}
