import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { blogPosts } from "@/lib/blog-posts";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Resume Matching Blog | ATS Resume Checker Tips | JobResumeMatch",
  description: "Read practical resume matching guides about ATS keywords, resume match scores, job description targeting, bullet improvements, and resume optimization.",
  path: "/blog"
});

const seoLinks = [
  { href: "/ats-resume-checker", label: "ATS Resume Checker" },
  { href: "/resume-match-score", label: "Resume Match Score" },
  { href: "/resume-keyword-scanner", label: "Resume Keyword Scanner" },
  { href: "/match-resume-to-job-description", label: "Match Resume to Job Description" },
  { href: "/resume-optimizer", label: "Resume Optimizer" },
  { href: "/free-resume-checker", label: "Free Resume Checker" }
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs current="Blog" />
      <main className="container py-12">
        <section className="max-w-4xl">
          <p className="inline-flex rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-sm">
            ATS resume guides
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#0b1220] md:text-6xl">Resume Matching Blog</h1>
          <p className="mt-5 text-lg leading-8 text-[#64748b]">
          Practical guides for improving resume targeting, ATS readability, keyword alignment, and job-specific applications.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={post.slug} className="group flex h-full flex-col rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)] transition hover:-translate-y-0.5 hover:border-[#93b4f7] hover:shadow-[0_18px_42px_-28px_rgba(37,99,235,0.28)]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#2563eb]">{post.category}</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#fbfdff] px-3 py-1 text-xs font-bold text-[#64748b]">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-5 text-2xl font-black leading-8 text-[#0b1220] group-hover:text-[#2563eb]">{post.h1}</h2>
              <p className="mt-3 grow leading-7 text-[#64748b]">{post.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-[#64748b]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" size={15} />
                  {post.readingTime}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" size={15} />
                  Updated {formatDate(post.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-[26px] bg-[#0b1220] p-7 text-white md:p-9">
          <h2 className="text-3xl font-black tracking-tight">Ready to check your own resume?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-blue-100">
            Run a free resume match analysis, find missing keywords, and preview job-specific resume improvements.
          </p>
          <Link href="/#checker" className="mt-6 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-white px-5 font-extrabold text-[#2563eb] shadow-sm hover:bg-blue-50">
            Check My Resume Free
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>

        <section className="mt-12 rounded-[22px] border border-[#dde7f5] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Explore resume tools</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {seoLinks.map((link) => (
              <Link key={link.href} href={link.href} className="focus-ring rounded-full border border-[#dde7f5] bg-[#fbfdff] px-4 py-2 text-sm font-extrabold text-[#2563eb] hover:bg-blue-50">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
