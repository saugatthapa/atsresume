import { writeFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const base = process.env.QA_BASE_URL || "http://localhost:3000";

const jobDescription = `We are hiring a Frontend Developer to build fast, responsive SaaS product experiences. The role requires strong React, Next.js, TypeScript, Tailwind CSS, JavaScript, HTML, CSS, REST APIs, responsive design, GitHub, Vercel, SEO, Core Web Vitals, performance optimization, accessibility, UI components, API integration, Prisma, PostgreSQL, and testing.`;

const cases = [
  {
    name: "aarav-no-sample-facts",
    resumeText: `Aarav Sharma
aarav.sharma@example.com
LinkedIn: https://linkedin.com/in/aaravsharma | GitHub: https://github.com/aaravsharma

Professional Summary
Frontend developer with experience building responsive SaaS interfaces using React, TypeScript, Next.js, and modern CSS.

Skills
React, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML, CSS, REST APIs, GitHub, Vercel

Work Experience
Frontend Developer - Northstar UI Studio | 2021 - 2023
- Built reusable React and TypeScript components for an internal analytics dashboard.
- Improved dashboard load time by reducing unused client JavaScript and optimizing API calls.
- Collaborated with product and design to release responsive landing pages.

Projects
- Created a Next.js portfolio site deployed on Vercel with SEO metadata, responsive layouts, and Core Web Vitals improvements.
- Integrated REST APIs into a job search prototype and added loading, empty, and error states for key screens.`,
    required: ["Aarav Sharma", "aarav.sharma@example.com", "Northstar UI Studio", "2021 - 2023"],
    forbidden: ["PixelCraft", "Web Academy", "BrightHire", "San Jose State", "San Francisco", "+1 555", "555 123", "12 internal teams", "32%", "Frontend Engineering Certificate"],
    forbiddenInOptimizedResume: ["Prisma", "PostgreSQL"]
  },
  {
    name: "no-education-no-phone-no-metrics",
    resumeText: `Mina Rai
mina.rai@example.com | Kathmandu, Nepal
LinkedIn: https://linkedin.com/in/minarai

Summary
Frontend developer experienced with React, JavaScript, HTML, CSS, and REST APIs.

Skills
React, JavaScript, HTML, CSS, REST APIs

Experience
Web Developer - ClearPath Digital | 2020 - 2022
- Built responsive product pages with React and CSS.
- Collaborated with designers to improve checkout UI.
- Integrated REST APIs for account settings screens.`,
    required: ["Mina Rai", "mina.rai@example.com", "Kathmandu, Nepal", "ClearPath Digital", "2020 - 2022"],
    forbidden: ["+1", "555", "Education", "University", "Certificate", "32%", "12 teams"],
    forbiddenInOptimizedResume: ["Prisma", "PostgreSQL"]
  }
];

function fail(message) {
  throw new Error(message);
}

function key(value) {
  return value.toLowerCase().replace(/[^a-z0-9+#]+/g, "");
}

async function analyzeCase(testCase) {
  const analysisResponse = await fetch(`${base}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText: testCase.resumeText, jobDescription })
  });
  const payload = await analysisResponse.json();
  if (!analysisResponse.ok) fail(`${testCase.name}: analysis failed ${JSON.stringify(payload)}`);
  const result = payload.analysis;
  const combinedResult = [result.optimizedResumePreview, result.weakBulletPoints.map((item) => `${item.original}\n${item.improved}`).join("\n")].join("\n");

  for (const required of testCase.required) {
    if (!result.optimizedResumePreview.includes(required)) fail(`${testCase.name}: missing original fact ${required}`);
  }
  for (const forbidden of testCase.forbidden) {
    if (combinedResult.includes(forbidden)) fail(`${testCase.name}: invented forbidden fact ${forbidden}`);
  }
  for (const forbidden of testCase.forbiddenInOptimizedResume ?? []) {
    if (result.optimizedResumePreview.includes(forbidden)) fail(`${testCase.name}: missing keyword inserted into optimized resume ${forbidden}`);
  }
  for (const item of result.weakBulletPoints) {
    if (key(item.original) === key(item.improved)) fail(`${testCase.name}: identical rewrite ${item.original}`);
  }

  const found = new Set([...result.matchedKeywords, ...result.skillsFound].map(key));
  const overlap = result.skillsMissing.filter((skill) => found.has(key(skill)));
  if (overlap.length) fail(`${testCase.name}: skill appears in found and missing ${overlap.join(", ")}`);

  const blockedPdf = await fetch(`${base}/api/download-pdf?token=${payload.token}`);
  const blockedPayload = await blockedPdf.json();
  if (blockedPdf.status !== 402 || blockedPayload.error !== "payment_required") fail(`${testCase.name}: unpaid PDF was not blocked`);

  const unlock = await fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: payload.token })
  });
  const unlockPayload = await unlock.json();
  if (!unlock.ok || unlockPayload.paidStatus !== true) fail(`${testCase.name}: dev unlock failed`);

  const paidPdf = await fetch(`${base}/api/download-pdf?token=${payload.token}`);
  const pdfBytes = Buffer.from(await paidPdf.arrayBuffer());
  if (!paidPdf.ok || !paidPdf.headers.get("content-type")?.includes("application/pdf")) fail(`${testCase.name}: paid PDF download failed`);
  const pdfPath = `qa-screenshots/${testCase.name}-no-hallucinated-facts.pdf`;
  writeFileSync(pdfPath, pdfBytes);
  const parsed = await pdfParse(pdfBytes);
  const pdfText = parsed.text || "";
  const optimizedPdfText = pdfText.slice(pdfText.indexOf("Optimized Resume Preview"));
  for (const forbidden of testCase.forbidden) {
    if (pdfText.includes(forbidden)) fail(`${testCase.name}: PDF contains forbidden fact ${forbidden}`);
  }
  for (const forbidden of testCase.forbiddenInOptimizedResume ?? []) {
    if (optimizedPdfText.includes(forbidden)) fail(`${testCase.name}: PDF optimized resume contains missing keyword ${forbidden}`);
  }
  for (const bad of ["\u00f0", "\u25a1", "\u00e2\u20ac\u00a2", "Page 1 of 1 Page"]) {
    if (pdfText.includes(bad)) fail(`${testCase.name}: PDF contains bad text ${JSON.stringify(bad)}`);
  }

  return { name: testCase.name, token: payload.token, pdfPath, rewrites: result.weakBulletPoints.map((item) => item.improved) };
}

const results = [];
for (const testCase of cases) {
  results.push(await analyzeCase(testCase));
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
