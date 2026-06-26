export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f6f9ff] px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[420px] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#d8e3f1] bg-white px-6 py-10 text-center shadow-[0_28px_80px_-48px_rgba(8,20,51,0.38)] sm:px-10 sm:py-12">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50">
            <span className="size-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#2563eb]" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-[#0f172a]">Preparing your page...</h1>
          <p className="mt-2 text-sm font-semibold text-[#64748b]">This usually takes a few seconds.</p>
        </div>
      </section>
    </main>
  );
}
