import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import type { BlogPost } from "@/lib/blog-posts";
import { getRelatedBlogPosts } from "@/lib/blog-posts";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";

const toolLinks = [
  { href: "/#checker", label: "free ATS resume checker" },
  { href: "/ats-resume-checker", label: "ATS resume checker guide" },
  { href: "/resume-match-score", label: "resume match score" },
  { href: "/resume-keyword-scanner", label: "resume keyword scanner" },
  { href: "/match-resume-to-job-description", label: "match resume to job description" },
  { href: "/resume-optimizer", label: "resume optimizer" }
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function blogPostingJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.h1,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "JobResumeMatch Editorial Team"
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(post.slug)
    },
    url: absoluteUrl(post.slug)
  };
}

function faqJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function BlogArticlePage({ post }: { post: BlogPost }) {
  const relatedPosts = getRelatedBlogPosts(post);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={faqJsonLd(post)} />
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: post.h1 }]} />
      <main className="container py-10">
        <article className="mx-auto max-w-[850px]">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-sm">
              <Tag aria-hidden="true" size={15} />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-bold text-[#64748b] shadow-sm">
              <Clock3 aria-hidden="true" size={15} />
              {post.readingTime}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dde7f5] bg-white px-4 py-2 text-sm font-bold text-[#64748b] shadow-sm">
              <CalendarDays aria-hidden="true" size={15} />
              Updated {formatDate(post.updatedAt)}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-tight text-[#0b1220] md:text-6xl">{post.h1}</h1>
          <p className="mt-6 text-xl leading-9 text-[#53657d]">{post.intro}</p>

          <div className="mt-7 flex flex-col gap-3 rounded-[22px] border border-[#cfe0fb] bg-[#eff6ff] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-[#2563eb]">Check your own resume</p>
              <p className="mt-1 leading-7 text-[#53657d]">Compare your resume with the job description before you apply.</p>
            </div>
            <Link href="/#checker" className="primary-button focus-ring inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold shadow-sm">
              Check My Resume Free
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <nav aria-label="Table of contents" className="mt-8 rounded-[22px] border border-[#dde7f5] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)]">
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#2563eb]">Table of contents</p>
            <ol className="mt-4 grid gap-2 text-sm font-bold text-[#53657d] sm:grid-cols-2">
              {post.sections.map((section) => (
                <li key={section.id}>
                  <Link href={`#${section.id}`} className="hover:text-[#2563eb]">
                    {section.heading}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="#mistakes" className="hover:text-[#2563eb]">
                  Mistakes to avoid
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-[#2563eb]">
                  FAQ
                </Link>
              </li>
            </ol>
          </nav>

          <div className="mt-10 space-y-12">
            {post.sections.map((section) => (
              <section key={section.id} id={section.id} className="rounded-[22px] border border-[#dde7f5] bg-white p-6 shadow-[0_14px_34px_-30px_rgba(8,20,51,0.18)] md:p-8">
                <h2 className="text-3xl font-black tracking-tight text-[#0b1220]">{section.heading}</h2>
                <div className="mt-5 space-y-4 text-lg leading-8 text-[#53657d]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 grid gap-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-2xl bg-[#fbfdff] px-4 py-3 leading-7 text-[#53657d]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.example ? (
                  <div className="mt-6 rounded-[18px] border border-[#cfe0fb] bg-[#f8fbff] p-5">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#2563eb]">{section.example.title}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-extrabold text-[#0b1220]">Before</p>
                        <p className="mt-2 leading-7 text-[#64748b]">{section.example.before}</p>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#0b1220]">After</p>
                        <p className="mt-2 leading-7 text-[#64748b]">{section.example.after}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <section id="mistakes" className="mt-12 rounded-[22px] border border-[#fde2c0] bg-[#fff8ed] p-6 md:p-8">
            <h2 className="text-3xl font-black tracking-tight text-[#0b1220]">Mistakes to avoid</h2>
            <ul className="mt-5 grid gap-3">
              {post.mistakes.map((mistake) => (
                <li key={mistake} className="rounded-2xl bg-white px-4 py-3 leading-7 text-[#53657d]">
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-[22px] border border-[#dde7f5] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-[#0b1220]">Useful tools for this guide</h2>
            <p className="mt-3 leading-7 text-[#64748b]">
              Use these related JobResumeMatch pages when you want to move from reading to checking a real application.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {toolLinks.map((link) => (
                <Link key={link.href} href={link.href} className="focus-ring rounded-full border border-[#dde7f5] bg-[#fbfdff] px-4 py-2 text-sm font-extrabold text-[#2563eb] hover:bg-blue-50">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section id="faq" className="mt-12">
            <h2 className="text-3xl font-black tracking-tight text-[#0b1220]">FAQ</h2>
            <div className="mt-5 grid gap-4">
              {post.faq.map((item) => (
                <details key={item.question} className="rounded-[18px] border border-[#dde7f5] bg-white px-6 py-5">
                  <summary className="cursor-pointer text-lg font-extrabold text-[#0b1220]">{item.question}</summary>
                  <p className="mt-3 leading-7 text-[#64748b]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="mt-8 rounded-[18px] border border-[#dde7f5] bg-[#fbfdff] p-5 text-sm font-semibold leading-7 text-[#64748b]">
            This is educational guidance. ATS systems and hiring processes vary by company.
          </p>

          <section className="mt-12 rounded-[22px] border border-[#dde7f5] bg-white p-6 md:p-8">
            <h2 className="text-3xl font-black tracking-tight text-[#0b1220]">Related articles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={related.slug} className="rounded-[18px] border border-[#dde7f5] bg-[#fbfdff] p-4 hover:border-[#93b4f7] hover:bg-blue-50">
                  <p className="text-sm font-extrabold text-[#2563eb]">{related.category}</p>
                  <h3 className="mt-2 font-black leading-6 text-[#0b1220]">{related.h1}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#64748b]">{related.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-[26px] bg-[#0b1220] p-7 text-white md:p-9">
            <h2 className="text-3xl font-black tracking-tight">Ready to check your own resume?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-blue-100">
              Run a free resume match analysis, review missing keywords, and decide whether the Resume Export Pass is worth unlocking for this application.
            </p>
            <Link href="/#checker" className="mt-6 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-white px-5 font-extrabold text-[#2563eb] shadow-sm hover:bg-blue-50">
              Check My Resume Free
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
