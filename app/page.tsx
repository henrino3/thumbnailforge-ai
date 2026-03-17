import Link from "next/link";
import Generator from "@/components/Generator";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <main className="pb-20">
      <Generator />

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        {[
          ["Built for creators", "Headline-first prompts tuned for YouTube-style visual tension, contrast, and clarity."],
          ["Faster than Canva", "Generate four thumbnail directions in one shot, then pick the strongest concept instead of staring at a blank canvas."],
          ["Download ready", "Every result is resized to 1280x720 PNG so it is ready for YouTube the moment you click download."],
        ].map(([title, description]) => (
          <article key={title} className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
          </article>
        ))}
      </section>

      <PricingSection />

      <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Learn the craft</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Thumbnail strategy for serious YouTube growth
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Browse our starter articles on click psychology, common mistakes, and how to fix weak thumbnails before they cost you views.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            Read the blog
          </Link>
        </div>
      </section>
    </main>
  );
}
