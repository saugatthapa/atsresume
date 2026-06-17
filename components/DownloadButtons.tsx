"use client";

import { BadgeCheck, Download, LockKeyhole } from "lucide-react";

export function DownloadButtons({ token, isPaid, onUnlock }: { token?: string; isPaid: boolean; onUnlock: () => void }) {
  const encodedToken = token ? encodeURIComponent(token) : "";
  const downloads = [
    { label: "Download Optimized Resume PDF", lockedLabel: "Download Resume PDF - Locked", href: `/api/download-resume-pdf?token=${encodedToken}` },
    { label: "Download Editable DOCX", lockedLabel: "Download Editable DOCX - Locked", href: `/api/download-resume-docx?token=${encodedToken}` },
    { label: "Download Full ATS Report PDF", lockedLabel: "Download ATS Report - Locked", href: `/api/download-report-pdf?token=${encodedToken}` }
  ];

  return (
    <div className="grid gap-3">
      {isPaid ? (
        downloads.map((download) => (
          <a
            key={download.href}
            className={`primary-button focus-ring inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl px-5 text-center font-extrabold shadow-sm ${!token ? "pointer-events-none opacity-60" : ""}`}
            href={token ? download.href : undefined}
            aria-disabled={!token}
          >
            <Download aria-hidden="true" size={18} />
            {download.label}
          </a>
        ))
      ) : (
        downloads.map((download) => (
          <button key={download.href} className="focus-ring inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[#bfd1ea] bg-white px-5 text-center font-extrabold text-[#2563eb] hover:bg-blue-50" onClick={onUnlock}>
            <LockKeyhole aria-hidden="true" size={18} />
            {download.lockedLabel}
          </button>
        ))
      )}
      {!isPaid ? (
        <p className="text-sm font-semibold text-[#64748b]">Unlock downloads to export your optimized resume.</p>
      ) : (
        <span className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-[#16a34a]">
          <BadgeCheck aria-hidden="true" size={17} />
          Full report unlocked
        </span>
      )}
    </div>
  );
}
