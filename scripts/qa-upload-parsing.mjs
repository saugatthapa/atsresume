import fs from "node:fs";
import path from "node:path";

const base = process.env.QA_BASE_URL || "http://localhost:3000";
const fixtureDir = path.join(process.cwd(), "qa-fixtures");
const jobDescription = `We are hiring a Frontend Developer to build responsive SaaS interfaces with React, Next.js, TypeScript, Tailwind CSS, REST APIs, SEO, Core Web Vitals, accessibility, testing, GitHub, Vercel, Prisma, and PostgreSQL. The role improves performance optimization, integrates APIs, collaborates with product design, and ships reliable UI components for web applications.`;

async function submitFixture(fileName) {
  const filePath = path.join(fixtureDir, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`Missing fixture: ${filePath}`);
  const form = new FormData();
  form.set("resumeText", "");
  form.set("jobDescription", jobDescription);
  const blob = new Blob([fs.readFileSync(filePath)], { type: mimeFor(fileName) });
  form.set("resumeFile", blob, fileName);
  const response = await fetch(`${base}/api/analyze`, { method: "POST", body: form });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${fileName} failed: ${payload.error}`);
  if (!payload.token || payload.analysis?.score < 60) throw new Error(`${fileName} returned an invalid analysis payload.`);
  return { fileName, token: payload.token, score: payload.analysis.score, matched: payload.analysis.matchedKeywords.slice(0, 5) };
}

function mimeFor(fileName) {
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "text/plain";
}

const results = [];
for (const fileName of ["fake-frontend-developer-resume.pdf", "fake-frontend-developer-resume.docx", "fake-frontend-developer-resume.txt"]) {
  results.push(await submitFixture(fileName));
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
