import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisResultView } from "@/components/AnalysisResultView";
import { getFreePreviewAnalysis, getPaidAnalysis } from "@/lib/analysis-access";
import { analysisSchema } from "@/lib/schema";
import { ensureDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Private Resume Match Result | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await ensureDatabase();
  const record = await prisma.analysis.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) notFound();
  const parsed = analysisSchema.safeParse(record.analysisJson);
  if (!parsed.success) notFound();

  const result = record.paidStatus ? getPaidAnalysis(parsed.data) : getFreePreviewAnalysis(parsed.data);

  return (
    <main className="min-h-screen bg-[#f6f9ff] pb-16 pt-4">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">Private noindex result</p>
      </div>
      <div>
        <AnalysisResultView result={result} token={token} initialPaid={record.paidStatus} />
      </div>
    </main>
  );
}
