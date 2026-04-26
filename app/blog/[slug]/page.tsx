import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getPost } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function BlogPostInlineCta({ slug }: { slug: string }) {
  return (
    <div className="my-10 rounded-[2rem] border border-orange-400/20 bg-gradient-to-br from-orange-500/12 to-red-500/10 p-6 not-prose md:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Try the workflow</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        Turn your next video title into 4 thumbnail directions in seconds.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        Reading about CTR is useful. Testing angles on your actual title is better. Generate four creator-ready concepts
        before you open Canva.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/#generator"
          data-analytics-event="cta_click"
          data-analytics-location="blog_inline_cta"
          data-analytics-label={`start_generating_${slug}`}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
        >
          Generate 4 thumbnail variants
        </Link>
        <Link
          href="/#pricing"
          data-analytics-event="cta_click"
          data-analytics-location="blog_inline_cta"
          data-analytics-label={`view_pricing_${slug}`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          See plans
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const blocks = post.content.trim().split("\n\n");
  const inlineCtaIndex = Math.min(4, Math.max(2, blocks.length - 2));

  return (
    <main className="pb-20">
      <article className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 md:px-10">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{post.description}</p>
        </div>
        <div className="prose-content mt-8 rounded-[2rem] border border-white/10 bg-black/10 px-6 py-10 md:px-10">
          {blocks.map((block, index) => {
            let content;

            if (block.startsWith("## ")) {
              content = <h2>{block.replace("## ", "")}</h2>;
            } else if (block.startsWith("### ")) {
              content = <h3>{block.replace("### ", "")}</h3>;
            } else if (block.startsWith("- ")) {
              content = (
                <ul>
                  {block.split("\n").map((item) => (
                    <li key={item}>{item.replace(/^[-]\s/, "")}</li>
                  ))}
                </ul>
              );
            } else {
              content = <p>{block}</p>;
            }

            return (
              <div key={index}>
                {content}
                {index === inlineCtaIndex ? <BlogPostInlineCta slug={post.slug} /> : null}
              </div>
            );
          })}

          <BlogPostInlineCta slug={`${post.slug}_footer`} />
        </div>
      </article>
    </main>
  );
}
