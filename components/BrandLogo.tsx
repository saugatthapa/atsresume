import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="JobResumeMatch home"
      className={`flex min-w-0 items-center gap-2.5 text-[#0f172a] ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 128 128"
        className="size-10 shrink-0 drop-shadow-[0_8px_16px_rgba(37,99,235,0.18)]"
      >
        <defs>
          <linearGradient id="brand-logo-bg" x1="16" x2="112" y1="10" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1557ff" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="112" height="112" x="8" y="8" rx="27" fill="url(#brand-logo-bg)" />
        <path
          fill="#ffffff"
          d="M81 27h21v56c0 24.5-17.4 40.5-43.2 40.5-24.4 0-40.8-15-40.8-38.1V72h21v12.8c0 11.4 7.8 19 19.9 19 13.3 0 22.1-8.2 22.1-21.6V27Z"
        />
        <rect width="35" height="6" x="29" y="29" rx="3" fill="#ffffff" />
        <rect width="35" height="6" x="29" y="44" rx="3" fill="#ffffff" opacity=".95" />
        <rect width="31" height="6" x="29" y="59" rx="3" fill="#ffffff" opacity=".9" />
        <path
          d="m48 78.5 11 10 14-16"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7.2"
        />
      </svg>
      <span className="truncate text-base font-black tracking-normal sm:text-xl">JobResumeMatch</span>
    </Link>
  );
}
