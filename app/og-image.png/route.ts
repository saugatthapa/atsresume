import { NextResponse } from "next/server";

export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8fbff"/>
  <rect x="80" y="80" width="1040" height="470" rx="28" fill="#ffffff" stroke="#dbe4f0"/>
  <text x="130" y="190" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800" fill="#111827">JobResumeMatch</text>
  <text x="130" y="270" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#315cf6">Free ATS Resume Checker</text>
  <text x="130" y="335" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#5b6475">Match your resume to any job description in seconds.</text>
  <circle cx="920" cy="292" r="112" fill="#315cf6"/>
  <text x="865" y="315" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800" fill="#ffffff">86</text>
  <text x="850" y="355" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff">MATCH SCORE</text>
</svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
