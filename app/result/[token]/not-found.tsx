import Link from "next/link";
import { SearchX } from "lucide-react";

export default function ResultNotFound() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#f6f9ff] px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[520px] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#d8e3f1] bg-white px-6 py-10 text-center shadow-[0_28px_80px_-48px_rgba(8,20,51,0.38)] sm:px-10 sm:py-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-[#2563eb]">
            <SearchX aria-hidden="true" size={34} />
          </div>
          <p className="mx-auto mt-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#2563eb]">Private result</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0b1220] sm:text-4xl">Result not found</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#64748b]">
            We could not find this resume match result. The link may be incorrect or expired.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="primary-button focus-ring inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 font-extrabold" href="/#checker">
              Check Resume Free
            </Link>
            <Link className="focus-ring inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[#d8e3f1] bg-white px-6 font-extrabold text-[#0b1220] hover:bg-slate-50" href="/">
              Go Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
