import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogArticlePage } from "@/components/BlogArticlePage";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { createMetadata } from "@/lib/seo";

const legacyRedirects: Record<string, string> = {
  "how-to-match-resume-to-job-description": "/blog/how-to-match-your-resume-to-a-job-description",
  "how-to-improve-ats-score": "/blog/how-to-improve-your-ats-score"
};

type BlogRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug.replace("/blog/", "")
  }));
}

export async function generateMetadata({ params }: BlogRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(`/blog/${slug}`);

  if (!post) {
    return {
      title: "Blog article | JobResumeMatch",
      robots: { index: false, follow: false }
    };
  }

  return createMetadata({
    title: post.metaTitle,
    description: post.description,
    path: post.slug
  });
}

export default async function BlogPostRoute({ params }: BlogRouteProps) {
  const { slug } = await params;

  if (legacyRedirects[slug]) {
    redirect(legacyRedirects[slug]);
  }

  const post = getBlogPost(`/blog/${slug}`);
  if (!post) notFound();

  return <BlogArticlePage post={post} />;
}
