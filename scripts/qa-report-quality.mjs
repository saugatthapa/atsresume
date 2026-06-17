const base = process.env.QA_BASE_URL || "http://localhost:3000";

const resumeText = `Aarav Sharma
aarav.sharma@example.com | +1 555 123 4567 | San Francisco, CA
LinkedIn: https://linkedin.com/in/aaravsharma | GitHub: https://github.com/aaravsharma

Professional Summary
Frontend developer with experience building responsive SaaS interfaces using React, TypeScript, Next.js, and modern CSS.

Technical Skills
React, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML, CSS, REST APIs, GitHub, Vercel

Work Experience
Frontend Developer - BrightHire Labs | 2022 - Present
- Built reusable React and TypeScript components for a hiring analytics dashboard used by 12 internal teams.
- Improved dashboard load time by 32% by reducing unused client JavaScript and optimizing API calls.
- Partnered with design and product to launch responsive candidate review workflows across desktop and mobile.

Projects
- Created a Next.js portfolio site deployed on Vercel with SEO metadata, responsive layouts, and Core Web Vitals improvements.
- Integrated REST APIs into a job search prototype and added loading, empty, and error states for key screens.

Education
BS Computer Science, San Jose State University`;

const jobDescription = `We are hiring a Frontend Developer to build fast, responsive SaaS product experiences. The role requires strong React, Next.js, TypeScript, Tailwind CSS, JavaScript, HTML, CSS, REST APIs, responsive design, GitHub, Vercel, SEO, Core Web Vitals, performance optimization, accessibility, UI components, and API integration. Experience with Prisma, PostgreSQL, and testing is a plus. You will collaborate with product and design to ship clean interfaces, improve page speed, and maintain high-quality frontend architecture.`;

function fail(message) {
  throw new Error(message);
}

const analysisResponse = await fetch(`${base}/api/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resumeText, jobDescription })
});
const analysisPayload = await analysisResponse.json();
if (!analysisResponse.ok) fail(`Analysis failed: ${JSON.stringify(analysisPayload)}`);

const result = analysisPayload.analysis;
if (result.score < 75 || result.score > 90) fail(`Expected score around 75-90, got ${result.score}`);

const badKeywords = ["experience.", "applications.", "closely", "collaboration.", "responsibilities", "qualifications", "candidate", "team", "work"];
const allKeywords = [...result.missingKeywords, ...result.matchedKeywords];
for (const keyword of allKeywords) {
  if (badKeywords.includes(keyword.toLowerCase())) fail(`Bad keyword leaked: ${keyword}`);
  if (/[.,]$/.test(keyword)) fail(`Keyword has trailing punctuation: ${keyword}`);
}

const expectedUsefulKeywords = ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST APIs", "SEO", "Core Web Vitals", "GitHub", "Responsive design", "Performance optimization"];
if (!expectedUsefulKeywords.some((keyword) => allKeywords.includes(keyword))) fail("Expected useful frontend keywords in report.");
if (result.jobTailoredSummary.includes("|") || result.jobTailoredSummary.split(/\s+/).length < 18) fail("Summary is not a real 2-3 sentence summary.");
for (const rewrite of result.weakBulletPoints) {
  if (/email|linkedin|github\.com|aarav sharma|\+1 555/i.test(rewrite.original)) fail(`Rewrite targeted non-bullet content: ${rewrite.original}`);
}

const freePdf = await fetch(`${base}/api/download-pdf?token=${analysisPayload.token}`);
const freePdfBytes = Buffer.from(await freePdf.arrayBuffer());
if (!freePdf.headers.get("content-type")?.includes("application/pdf")) fail("Free export is not PDF.");
if (!freePdfBytes.includes(Buffer.from("Preview copy - Created with JobResumeMatch.com"))) fail("Free PDF watermark missing.");
for (const heading of ["ATS Match Summary", "Missing Keywords", "Matched Keywords", "Skills Found", "Skills Missing", "Job-Tailored Summary", "Improved Bullet Suggestions", "Optimized Resume Preview"]) {
  if (!freePdfBytes.includes(Buffer.from(heading))) fail(`PDF missing heading: ${heading}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      token: analysisPayload.token,
      score: result.score,
      missingKeywords: result.missingKeywords,
      matchedKeywords: result.matchedKeywords,
      summary: result.jobTailoredSummary,
      rewrites: result.weakBulletPoints.map((item) => item.original)
    },
    null,
    2
  )
);
