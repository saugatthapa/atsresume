import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout | JobResumeMatch",
  robots: { index: false, follow: false }
};

export default function CheckoutPage() {
  return (
    <main className="container grid min-h-[70vh] place-items-center py-20">
      <div className="w-full max-w-xl rounded-[28px] border border-[#dde7f5] bg-white p-8 shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
        <p className="text-sm font-black uppercase tracking-wide text-[#2563eb]">Checkout moved</p>
        <h1 className="mt-3 text-4xl font-black text-[#0b1220]">Open your result page</h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          Resume Export Pass checkout now starts from the result page.
        </p>
        <Link className="primary-button focus-ring mt-6 inline-flex rounded-xl px-5 py-3 font-extrabold" href="/">
          Go to JobResumeMatch
        </Link>
      </div>
    </main>
  );
}
