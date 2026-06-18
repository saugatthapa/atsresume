import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function Breadcrumbs({ current, items }: { current?: string; items?: BreadcrumbItem[] }) {
  const trail = items ?? [{ name: current ?? "Current page" }];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      ...trail.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        ...(item.href ? { item: absoluteUrl(item.href) } : {})
      }))
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <nav aria-label="Breadcrumb" className="container pt-8 text-sm font-semibold text-[#64748b]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[#2563eb]">
              Home
            </Link>
          </li>
          {trail.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-[#2563eb]">
                  {item.name}
                </Link>
              ) : (
                <span className="font-bold text-[#0b1220]">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
