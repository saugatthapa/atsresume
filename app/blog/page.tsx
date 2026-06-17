import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { blogPages } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Resume Matching Blog | JobResumeMatch",
  description: "Helpful guides for ATS resume keywords, resume match scores, and tailoring resumes to job descriptions.",
  path: "/blog"
});

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs current="Blog" />
      <main className="container py-12">
        <h1 className="text-4xl font-black text-slate-950">Resume Matching Blog</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
          Practical guides for improving resume targeting, ATS readability, keyword alignment, and job-specific applications.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {blogPages.map((post) => (
            <Link key={post.slug} href={post.slug} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300">
              <h2 className="text-xl font-extrabold text-slate-950">{post.h1}</h2>
              <p className="mt-3 leading-7 text-slate-700">{post.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
