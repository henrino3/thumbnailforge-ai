import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getPost } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

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

  return (
    <main className="pb-20">
      <article className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">{post.publishedAt}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{post.description}</p>
        </div>
        <div className="prose-content mt-8 rounded-[2rem] border border-white/10 bg-black/10 px-6 py-10 md:px-10">
          {post.content
            .trim()
            .split("\n\n")
            .map((block, index) => {
              if (block.startsWith("## ")) {
                return <h2 key={index}>{block.replace("## ", "")}</h2>;
              }
              if (block.startsWith("### ")) {
                return <h3 key={index}>{block.replace("### ", "")}</h3>;
              }
              if (block.startsWith("- ")) {
                return (
                  <ul key={index}>
                    {block.split("\n").map((item) => (
                      <li key={item}>{item.replace(/^-\s/, "")}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{block}</p>;
            })}
        </div>
      </article>
    </main>
  );
}
