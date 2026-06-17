"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, LockKeyhole, SearchX, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/schema";
import { DownloadButtons } from "@/components/DownloadButtons";
import { KeywordPills } from "@/components/KeywordPills";
import { PaymentUnlockModal } from "@/components/PaymentUnlockModal";

type ResumeSection = {
  title: string;
  items: Array<{ type: "paragraph" | "bullet"; text: string }>;
};

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

export function AnalysisResultView({ result, token, initialPaid = false }: { result: AnalysisResult; token?: string; initialPaid?: boolean }) {
  const isPaid = initialPaid;
  const [unlockOpen, setUnlockOpen] = useState(false);
  const resumePreview = useMemo(() => parseResumePreview(result.optimizedResumePreview), [result.optimizedResumePreview]);
  const visibleBullets = result.weakBulletPoints.slice(0, isPaid ? undefined : 1);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[#dbe7f5] bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="rounded-[24px] border border-blue-100 bg-[#f8fbff] p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#64748b]">Estimated ATS Match Score</p>
            <div className="mt-3 flex items-end gap-2">
              <span className={`text-6xl font-black ${scoreColor(result.score)}`}>{result.score}</span>
              <span className="pb-2 text-lg font-black text-[#64748b]">/100</span>
            </div>
            <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-[#2563eb]">{result.scoreLabel} match</p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-[#16a34a]">{isPaid ? "Full report unlocked" : "Free scan preview"}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900">
                <AlertTriangle aria-hidden="true" size={15} />
                Estimated guidance only. Hiring systems vary.
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#0f172a]">Your resume match report</h2>
            <p className="mt-3 max-w-3xl leading-7 text-[#64748b]">{cleanDisplayText(result.summary)}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <MiniKeywordBlock title="Top Missing Keywords" items={result.missingKeywords} tone="red" />
              <MiniKeywordBlock title="Top Matched Keywords" items={result.matchedKeywords} tone="green" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-8">
          <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <BadgeCheck aria-hidden="true" size={20} className="text-[#2563eb]" />
              <h2 className="text-xl font-black text-[#0f172a]">Skills Found</h2>
            </div>
            <div className="mt-4">
              <KeywordPills items={result.skillsFound} tone="green" />
            </div>
            {!isPaid && <p className="mt-4 text-sm font-semibold text-[#64748b]">Free preview shows the top 5 skills found.</p>}
          </section>

          {isPaid ? (
            <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <SearchX aria-hidden="true" size={20} className="text-[#2563eb]" />
                <h2 className="text-xl font-black text-[#0f172a]">Full Skills Gap Report</h2>
              </div>
              <div className="mt-4">
                <KeywordPills items={result.skillsMissing} tone="red" emptyMessage="No major missing skills found." />
              </div>
            </section>
          ) : null}

          {isPaid && (
            <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles aria-hidden="true" size={20} className="text-[#2563eb]" />
                <h2 className="text-xl font-black text-[#0f172a]">Job-Tailored Summary</h2>
              </div>
              <p className="leading-7 text-[#53657d]">{cleanDisplayText(result.jobTailoredSummary)}</p>
            </section>
          )}

          <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" size={20} className="text-[#2563eb]" />
              <h2 className="text-xl font-black text-[#0f172a]">{isPaid ? "Improved Bullet Suggestions" : "Preview Rewrite Suggestion"}</h2>
            </div>
            {visibleBullets.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {visibleBullets.map((row) => (
                  <article key={`${row.original}-${row.improved}`} className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[#64748b]">Original</p>
                      <p className="mt-2 leading-6 text-[#53657d]">{cleanDisplayText(row.original)}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[#2563eb]">Improved</p>
                      <p className="mt-2 font-semibold leading-7 text-[#0f172a]">{cleanDisplayText(row.improved)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 leading-7 text-[#53657d]">No rewritten bullet suggestions were generated for this preview.</p>
            )}
            {!isPaid && <p className="mt-4 text-sm font-semibold text-[#64748b]">Unlock to view all improved bullet suggestions.</p>}
          </section>

          <section className="scroll-mt-28">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-[#0f172a]">Optimized Resume Preview</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748b]">
                {isPaid ? "Review the full optimized resume and export clean files when ready." : "Preview the summary, skills, and first improvements. Unlock to view the complete optimized resume."}
              </p>
            </div>
            <ResumeDocument preview={resumePreview} locked={!isPaid} onUnlock={() => setUnlockOpen(true)} />
          </section>

          {!isPaid && <MobileUnlockCTA onUnlock={() => setUnlockOpen(true)} />}
        </div>

        <aside className="lg:sticky lg:top-24">
          <UnlockSidebar isPaid={isPaid} token={token} onUnlock={() => setUnlockOpen(true)} />
        </aside>
      </div>

      <PaymentUnlockModal
        open={unlockOpen}
        token={token}
        onClose={() => setUnlockOpen(false)}
      />
    </div>
  );
}

function MiniKeywordBlock({ title, items, tone }: { title: string; items: string[]; tone: "green" | "red" }) {
  return (
    <div className="rounded-2xl border border-[#dbe7f5] bg-white p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#64748b]">{title}</p>
      <KeywordPills items={items} tone={tone} />
    </div>
  );
}

function UnlockSidebar({ isPaid, token, onUnlock }: { isPaid: boolean; token?: string; onUnlock: () => void }) {
  return (
    <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
        {isPaid ? <BadgeCheck aria-hidden="true" size={24} /> : <LockKeyhole aria-hidden="true" size={24} />}
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-[#0f172a]">{isPaid ? "Your downloads are unlocked" : "Download and unlock full resume"}</h2>
      <p className="mt-3 text-sm leading-6 text-[#64748b]">
        {isPaid
          ? "Download your optimized resume and full ATS report."
          : "Preview the key improvements for free. Unlock the complete resume and clean downloads when ready."}
      </p>

      {!isPaid && (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-[#f8fbff] p-5">
          <p className="text-sm font-extrabold text-[#0f172a]">$4.99 one-time unlock</p>
          <button className="focus-ring mt-4 inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-extrabold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700" onClick={onUnlock}>
            Unlock Full Resume - $4.99
          </button>
          <p className="mt-3 text-center text-xs font-semibold text-[#64748b]">No subscription. One-time unlock for this result.</p>
        </div>
      )}

      <ul className="mt-5 grid gap-3 text-sm font-semibold leading-6 text-[#53657d]">
        {["Full optimized resume", "All work experience bullets", "Projects and education sections", "Editable DOCX", "Clean PDF", "Full ATS report"].map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 aria-hidden="true" size={17} className="mt-1 shrink-0 text-[#16a34a]" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <DownloadButtons token={token} isPaid={isPaid} onUnlock={onUnlock} />
      </div>
    </section>
  );
}

function MobileUnlockCTA({ onUnlock }: { onUnlock: () => void }) {
  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-sm lg:hidden">
      <h2 className="text-xl font-black text-[#0f172a]">Ready for the full resume?</h2>
      <p className="mt-2 text-sm leading-6 text-[#64748b]">Unlock the complete optimized resume, all rewrite suggestions, and clean PDF/DOCX downloads.</p>
      <button className="focus-ring mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-extrabold text-white shadow-sm" onClick={onUnlock}>
        Unlock Full Resume - $4.99
      </button>
    </section>
  );
}

function ResumeDocument({ preview, locked, onUnlock }: { preview: ReturnType<typeof parseResumePreview>; locked: boolean; onUnlock: () => void }) {
  return (
    <article className={`resume-document relative overflow-hidden rounded-[18px] border border-[#d8e3f1] px-6 py-8 shadow-[0_28px_80px_-48px_rgba(8,20,51,0.42)] md:px-12 md:py-10 ${locked ? "select-none" : ""}`} onContextMenu={locked ? (event) => event.preventDefault() : undefined}>
      <div className="relative z-10">
        {preview.name && <h1>{preview.name}</h1>}
        {preview.contact.length > 0 && (
          <div className="resume-contact">
            {preview.contact.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
        {preview.sections.map((section, index) => (
          <section key={`${section.title}-${index}`}>
            <h2>{section.title}</h2>
            <div>{renderResumeItems(section.items, section.title)}</div>
          </section>
        ))}
      </div>
      {locked && (
        <div className="relative z-10 mt-6 rounded-[18px] border border-blue-100 bg-[#f8fbff] p-5 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#0b1220]">Full optimized resume locked</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#64748b]">
            Your free preview shows the summary, skills, and first few improvements. Unlock the complete optimized resume, all rewrite suggestions, and clean PDF/DOCX downloads.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-xs font-semibold text-[#64748b]">Unlock to view the full optimized resume, projects, education, and all bullet improvements.</p>
          <button className="primary-button focus-ring mt-4 inline-flex rounded-xl px-5 py-3 font-extrabold" onClick={onUnlock}>
            Unlock Full Resume - $4.99
          </button>
        </div>
      )}
    </article>
  );
}

function renderResumeItems(items: ResumeSection["items"], sectionTitle: string) {
  const nodes: ReactNode[] = [];
  let pendingBullets: string[] = [];

  function flushBullets(index: number) {
    if (pendingBullets.length === 0) return;
    nodes.push(
      <ul key={`${sectionTitle}-bullets-${index}`}>
        {pendingBullets.map((text, bulletIndex) => (
          <li key={`${text}-${bulletIndex}`}>{text}</li>
        ))}
      </ul>
    );
    pendingBullets = [];
  }

  items.forEach((item, index) => {
    if (item.type === "bullet") {
      pendingBullets.push(item.text);
      return;
    }

    flushBullets(index);
    nodes.push(
      <p key={`${sectionTitle}-paragraph-${index}`} className={isRoleLine(item.text) ? "resume-role-line" : undefined}>
        {item.text}
      </p>
    );
  });

  flushBullets(items.length);
  return nodes;
}

function parseResumePreview(value: string) {
  const lines = cleanDisplayText(value)
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

function cleanDisplayText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(mailto:([^)]+)\)/gi, (_match, label: string, email: string) => cleanMailto(label, email))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^(?:\u00f0[\u00b7\u2022]?|\u00e2\u20ac\u00a2)\s*/gm, "- ")
    .replace(/^[\u25A1\u25A0\u25AA]\s*/gm, "- ")
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

function isRoleLine(text: string) {
  return /\b(19|20)\d{2}\b/.test(text) && /[-|]/.test(text);
}

function scoreColor(score: number) {
  if (score >= 82) return "text-[#16a34a]";
  if (score >= 65) return "text-[#2563eb]";
  if (score >= 45) return "text-[#d97706]";
  return "text-rose-700";
}

function hasPhoneNumber(line: string) {
  const digitCount = (line.match(/\d/g) ?? []).length;
  return digitCount >= 9 && /(?:\+\d|\(\d{2,}\)|\d{3}[\s.-]\d{3})/.test(line);
}
