import Link from "next/link";

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="container pt-8 text-sm font-semibold text-[#64748b]">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-[#2563eb]">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-bold text-[#0b1220]">{current}</li>
      </ol>
    </nav>
  );
}
