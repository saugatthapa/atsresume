import { createRequire } from "module";
import mammoth from "mammoth";

const unreadablePdfMessage = "We could not read this PDF. Please paste your resume text or upload a DOCX file.";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buffer: Buffer) => Promise<{ text?: string }>;

export class FileParsingError extends Error {
  constructor(
    message: string,
    public readonly code: "UNREADABLE_PDF" | "UNSUPPORTED_FILE" | "EMPTY_FILE"
  ) {
    super(message);
    this.name = "FileParsingError";
  }
}

export async function extractFileText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) return extractPdfText(buffer, file.name);
  if (type.includes("wordprocessingml") || name.endsWith(".docx")) return extractDocxText(buffer, file.name);
  if (type.includes("text") || name.endsWith(".txt")) return cleanExtractedText(buffer.toString("utf8"));

  throw new FileParsingError("Unsupported file type. Please upload PDF, DOCX, TXT, or paste resume text.", "UNSUPPORTED_FILE");
}

async function extractPdfText(buffer: Buffer, fileName: string) {
  try {
    const parsed = await pdfParse(buffer);
    const text = cleanExtractedText(parsed.text || "");
    if (text.length < 40) throw new Error("PDF text extraction returned too little text.");
    return text;
  } catch (error) {
    console.error("[file-parser] PDF parsing failed", {
      fileName,
      message: error instanceof Error ? error.message : String(error)
    });
    throw new FileParsingError(unreadablePdfMessage, "UNREADABLE_PDF");
  }
}

async function extractDocxText(buffer: Buffer, fileName: string) {
  try {
    const parsed = await mammoth.extractRawText({ buffer });
    const text = cleanExtractedText(parsed.value || "");
    if (text.length < 40) throw new FileParsingError("This DOCX file did not contain readable resume text.", "EMPTY_FILE");
    return text;
  } catch (error) {
    if (error instanceof FileParsingError) throw error;
    console.error("[file-parser] DOCX parsing failed", {
      fileName,
      message: error instanceof Error ? error.message : String(error)
    });
    throw new FileParsingError("We could not read this DOCX file. Please paste your resume text or upload a TXT file.", "EMPTY_FILE");
  }
}

export function cleanExtractedText(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/gi, (_match, label: string, email: string) => {
      const cleanEmail = decodeURIComponent(email).replace(/^mailto:/i, "").split("?")[0].trim();
      return cleanEmail.includes("@") ? cleanEmail : label;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
