import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 py-3">
      <div className="container flex min-h-[62px] items-center justify-between gap-2 rounded-2xl border border-[#dde7f5] bg-white/95 px-3 shadow-[0_14px_34px_-24px_rgba(8,20,51,0.2)] backdrop-blur sm:gap-4 sm:px-4 md:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#64748b] lg:flex" aria-label="Main navigation">
          <Link href="/ats-resume-checker">ATS Checker</Link>
          <Link href="/resume-match-score">Resume Match Score</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <Link href="/#checker" className="primary-button focus-ring whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-sm">
          <span className="hidden sm:inline">Check Resume Free</span>
          <span className="sm:hidden">Check Free</span>
        </Link>
      </div>
    </header>
  );
}
