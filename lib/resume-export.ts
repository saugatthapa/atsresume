import { jsPDF } from "jspdf";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType
} from "docx";
import type { AnalysisResult } from "@/lib/schema";

type ResumeItem = { type: "paragraph" | "bullet"; text: string };
type ResumeSection = { title: string; items: ResumeItem[] };
type ResumePreview = { name: string; contact: string[]; sections: ResumeSection[] };

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const contentWidth = pageWidth - margin * 2;

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

export function buildOptimizedResumePdf(result: AnalysisResult) {
  const preview = parseResumePreview(result.optimizedResumePreview);
  const doc = new jsPDF({ unit: "pt", format: "letter", compress: false });
  let y = margin;

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
    const contactLines = splitPdfText(doc, preview.contact.join(" | "), contentWidth - 56);
    for (const line of contactLines) {
      writeText(doc, line, pageWidth / 2, y, { align: "center" });
      y += 11;
    }
  }

  y += 12;
  for (const section of preview.sections) {
    y = ensureSpace(doc, y, 70);
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
        y = addResumeBullet(doc, y, item.text);
      } else {
        const isRole = isRoleLine(item.text);
        doc.setFont("helvetica", isRole ? "bold" : "normal");
        const lines = splitPdfText(doc, item.text, contentWidth);
        for (const line of lines) {
          y = ensureSpace(doc, y, 24);
          writeText(doc, line, margin, y);
          y += 13;
        }
        y += 2;
      }
    }
    y += 8;
  }

  addFooter(doc);
  return Buffer.from(doc.output("arraybuffer"));
}

export async function buildOptimizedResumeDocx(result: AnalysisResult) {
  const preview = parseResumePreview(result.optimizedResumePreview);
  const children: Paragraph[] = [];

  if (preview.name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: preview.name, bold: true, size: 28 })]
      })
    );
  }

  if (preview.contact.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: preview.contact.join(" | "), size: 18, color: "475569" })]
      })
    );
  }

  for (const section of preview.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [new TextRun({ text: section.title, bold: true, size: 22, underline: { type: UnderlineType.SINGLE } })]
      })
    );

    for (const item of section.items) {
      children.push(
        new Paragraph({
          bullet: item.type === "bullet" ? { level: 0 } : undefined,
          spacing: { after: 80 },
          children: [new TextRun({ text: item.text, size: 20, bold: item.type === "paragraph" && isRoleLine(item.text) })]
        })
      );
    }
  }

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children
      }
    ]
  });

  return Packer.toBuffer(document);
}

export function parseResumePreview(value: string): ResumePreview {
  const lines = cleanResumeText(value)
    .replace(/\nTargeted professional summary:[\s\S]*$/i, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines.find((line) => !detectSectionTitle(line) && !isContactDetailLine(line) && !isBulletLine(line)) ?? "";
  const nameIndex = name ? lines.indexOf(name) : -1;
  const contact: string[] = [];
  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;

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
    sections: normalizeResumeSections(sections)
  };
}

function normalizeResumeSections(sections: ResumeSection[]) {
  const order = ["Professional Summary", "Core Skills", "Work Experience", "Projects", "Education", "Certifications"];
  const merged = new Map<string, ResumeSection>();

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

function cleanResumeText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/gi, (_match, label: string, email: string) => cleanMailto(label, email))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^(?:[-*]\s*|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[\u2022\u2023\u25A1\u25A0\u25AA]|[?\uFFFD]{1,4})\s*/gm, "- ")
    .replace(/(?:\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[\u25A1\u25A0\u25AA])/g, "")
    .replace(/[*_`#>]+/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanMailto(label: string, email: string) {
  const decoded = decodeURIComponent(email).replace(/^mailto:/i, "").split("?")[0].trim();
  return decoded.includes("@") ? decoded : label;
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

function isBulletLine(line: string) {
  return /^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*\S+/.test(line);
}

function stripBulletMarker(line: string) {
  return line.replace(/^(?:[-*\u2022\u2023\u25A1\u25AA]|\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2|[?\uFFFD]{1,4})\s*/, "").trim();
}

function isRoleLine(text: string) {
  return /\b(19|20)\d{2}\b/.test(text) && /[-|]/.test(text);
}

function addResumeBullet(doc: jsPDF, y: number, text: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const clean = cleanResumeText(text).replace(/^(?:[-*]\s*)+/, "").trim();
  const lines = splitPdfText(doc, clean, contentWidth - 18);
  for (let index = 0; index < lines.length; index += 1) {
    y = ensureSpace(doc, y, 24);
    writeText(doc, index === 0 ? `- ${lines[index]}` : lines[index], index === 0 ? margin : margin + 14, y);
    y += 13;
  }
  return y + 2;
}

function ensureSpace(doc: jsPDF, y: number, required: number) {
  if (y + required < pageHeight - 58) return y;
  doc.addPage();
  return margin;
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 42, pageWidth - margin, pageHeight - 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    writeText(doc, "Optimized resume - JobResumeMatch.com", margin, pageHeight - 24);
    writeText(doc, `Page ${i} of ${pages}`, pageWidth - margin - 48, pageHeight - 24);
  }
}

function splitPdfText(doc: jsPDF, text: string, width: number) {
  return doc.splitTextToSize(cleanResumeText(text), width) as string[];
}

function writeText(doc: jsPDF, text: string, x: number, y: number, options?: Parameters<jsPDF["text"]>[3]) {
  doc.text(cleanResumeText(text), x, y, options);
}

function hasPhoneNumber(line: string) {
  const digitCount = (line.match(/\d/g) ?? []).length;
  return digitCount >= 9 && /(?:\+\d|\(\d{2,}\)|\d{3}[\s.-]\d{3})/.test(line);
}
