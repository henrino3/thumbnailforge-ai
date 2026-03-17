import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thumbnail strategy, click psychology, and YouTube growth insights for creators.",
};

export default function BlogIndexPage() {
  return (
    <main className="pb-20">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Blog</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Better thumbnails start with better thinking.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Practical guides for creators who want more clicks without turning every thumbnail into spam.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-panel rounded-3xl p-7 transition hover:-translate-y-1">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>{post.publishedAt}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">{post.title}</h2>
            <p className="mt-4 max-w-3xl text-slate-300">{post.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
