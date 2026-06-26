export default function ResultLoading() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f6f9ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50">
            <span className="size-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#2563eb]" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">Preparing your resume match report...</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748b]">This usually takes a few seconds.</p>
        </div>

        <div className="mt-8 animate-pulse">
          <section className="rounded-3xl border border-[#dbe7f5] bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
              <div className="rounded-[24px] border border-blue-100 bg-[#f8fbff] p-5">
                <div className="h-3 w-36 rounded-full bg-slate-200" />
                <div className="mt-5 h-16 w-28 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-8 w-32 rounded-full bg-blue-100" />
              </div>
              <div>
                <div className="flex flex-wrap gap-3">
                  <div className="h-8 w-32 rounded-full bg-emerald-100" />
                  <div className="h-8 w-52 rounded-full bg-amber-100" />
                </div>
                <div className="mt-5 h-8 w-72 max-w-full rounded-full bg-slate-200" />
                <div className="mt-4 grid gap-3">
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-10/12 rounded-full bg-slate-200" />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <SkeletonKeywordCard />
                  <SkeletonKeywordCard />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="space-y-8">
              <SkeletonPanel rows={2} />
              <SkeletonPanel rows={4} />
              <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
                <div className="h-7 w-64 max-w-full rounded-full bg-slate-200" />
                <div className="mt-5 rounded-[18px] border border-[#d8e3f1] bg-white px-6 py-8 md:px-12 md:py-10">
                  <div className="mx-auto h-7 w-52 rounded-full bg-slate-200" />
                  <div className="mx-auto mt-4 h-3 w-72 max-w-full rounded-full bg-slate-200" />
                  <div className="mt-8 space-y-4">
                    <div className="h-4 w-40 rounded-full bg-slate-200" />
                    <div className="h-3 w-full rounded-full bg-slate-200" />
                    <div className="h-3 w-11/12 rounded-full bg-slate-200" />
                    <div className="h-3 w-9/12 rounded-full bg-slate-200" />
                    <div className="pt-5">
                      <div className="h-4 w-32 rounded-full bg-slate-200" />
                      <div className="mt-4 grid gap-3">
                        <div className="h-3 w-full rounded-full bg-slate-200" />
                        <div className="h-3 w-10/12 rounded-full bg-slate-200" />
                        <div className="h-3 w-8/12 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
              <div className="size-12 rounded-2xl bg-blue-100" />
              <div className="mt-5 h-7 w-56 max-w-full rounded-full bg-slate-200" />
              <div className="mt-4 space-y-3">
                <div className="h-3 w-full rounded-full bg-slate-200" />
                <div className="h-3 w-10/12 rounded-full bg-slate-200" />
              </div>
              <div className="mt-6 h-12 rounded-xl bg-blue-100" />
              <div className="mt-6 grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-4 w-11/12 rounded-full bg-slate-200" />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonKeywordCard() {
  return (
    <div className="rounded-2xl border border-[#dbe7f5] bg-white p-4">
      <div className="h-3 w-36 rounded-full bg-slate-200" />
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-8 w-20 rounded-full bg-slate-200" />
        <div className="h-8 w-28 rounded-full bg-slate-200" />
        <div className="h-8 w-24 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

function SkeletonPanel({ rows }: { rows: number }) {
  return (
    <section className="rounded-3xl border border-[#dbe7f5] bg-white p-6 shadow-sm">
      <div className="h-6 w-44 rounded-full bg-slate-200" />
      <div className="mt-5 grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-4 w-full rounded-full bg-slate-200" />
        ))}
      </div>
    </section>
  );
}
