import Link from "next/link";

const links = [
  ["/ats-resume-checker", "ATS Resume Checker"],
  ["/resume-keyword-scanner", "Resume Keyword Scanner"],
  ["/resume-optimizer", "Resume Optimizer"],
  ["/about", "About"],
  ["/pricing", "Pricing"],
  ["/contact", "Contact"],
  ["/privacy-policy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
  ["/refund-policy", "Refund Policy"],
  ["/digital-delivery-policy", "Digital Delivery Policy"]
];

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0b1220] text-white">
      <div className="container grid gap-10 py-16 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="text-2xl font-extrabold">JobResumeMatch</p>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
            Estimated ATS resume matching, missing keyword checks, and resume improvement suggestions. Guidance only, never a hiring guarantee.
          </p>
        </div>
        <nav className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 md:grid-cols-3" aria-label="Footer navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
