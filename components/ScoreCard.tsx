import { Gauge } from "lucide-react";
import type { AnalysisResult } from "@/lib/schema";

export function ScoreCard({ result }: { result: AnalysisResult }) {
  const color = result.score >= 82 ? "text-[#16a34a]" : result.score >= 65 ? "text-[#2563eb]" : result.score >= 45 ? "text-[#d97706]" : "text-rose-700";
  return (
    <section className="rounded-[28px] border border-[#dde7f5] bg-white p-7 shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
          <Gauge aria-hidden="true" size={25} />
        </span>
        <p className="text-sm font-black uppercase tracking-wide text-[#64748b]">Estimated ATS match score</p>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <span className={`text-6xl font-black ${color}`}>{result.score}</span>
        <span className="pb-2 text-xl font-bold text-[#64748b]">/100</span>
      </div>
      <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-[#2563eb]">{result.scoreLabel} match</p>
      <p className="mt-5 leading-7 text-[#64748b]">{result.summary}</p>
    </section>
  );
}
