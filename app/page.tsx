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

      <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Creator proof</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Built for creators who need faster thumbnail testing, not more design busywork.
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Social proof works best when it is specific, so we lead with the outcomes creators actually care about: more concepts tested, less blank-canvas time, and faster publishing momentum.
            </p>
          </div>
          <Link
            href="/blog/social-proof-for-creators-what-results-actually-matter"
            data-analytics-event="cta_click"
            data-analytics-location="creator_social_proof"
            data-analytics-label="read_social_proof_article"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            See creator proof ideas
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["4 concepts in seconds", "Creators can compare multiple visual hooks before opening Canva."],
            ["Built for weekly publishing", "Faster ideation helps solo creators keep momentum without lowering standards."],
            ["Better fit for CTR testing", "Use ThumbnailForge to shortlist concepts, then polish only the strongest option."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <PricingSection />

      <section className="mt-24 grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 px-6 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Why creators switch</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Go from title idea to testable thumbnail concepts before Canva even opens.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            ThumbnailForge is built for creators who need fast iteration, not pixel-perfect design work. Generate options, test the strongest angle, then refine only the winner.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#generator"
              data-analytics-event="cta_click"
              data-analytics-location="thumbnail_comparison"
              data-analytics-label="start_generating"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
            >
              Generate thumbnails now
            </Link>
            <Link
              href="#pricing"
              data-analytics-event="cta_click"
              data-analytics-location="thumbnail_comparison"
              data-analytics-label="compare_plans"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Compare plans
            </Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-sm text-slate-200">
          {[
            ["ThumbnailForge", "4 concepts in seconds", "Best when speed and testing matter most"],
            ["Manual Canva workflow", "20 to 30 minutes per idea", "Best after you already know the winning concept"],
            ["Design hire or agency", "$20 to $100+ per thumbnail", "Best for polished production at scale"],
          ].map(([tool, speed, fit]) => (
            <div key={tool} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{tool}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">{speed}</p>
              </div>
              <p className="mt-2 text-slate-300">{fit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Learn the craft</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              A full creator-growth content hub, not just a starter blog
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Browse in-depth articles on YouTube thumbnail strategy, creator tutorials, case studies, thumbnail SEO, and community-led growth.
            </p>
          </div>
          <Link
            href="/blog"
            data-analytics-event="cta_click"
            data-analytics-location="thumbnail_blog_section"
            data-analytics-label="read_blog"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            Explore 25+ articles
          </Link>
        </div>
      </section>

      <section className="mt-24">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">From the lab</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">More AI Tools from Money Z</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="https://websitereviewai.com" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-orange-400/50 transition-all">
            <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">SiteInsight AI</div>
            <p className="text-xs text-slate-400 mt-2">Get your website reviewed by AI in seconds</p>
          </a>
          <a href="https://modelhub-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-orange-400/50 transition-all">
            <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">ModelHub AI</div>
            <p className="text-xs text-slate-400 mt-2">Compare &amp; chat with all AI models in one place</p>
          </a>
          <a href="https://contentmorph-ai-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-orange-400/50 transition-all">
            <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">ContentMorph AI</div>
            <p className="text-xs text-slate-400 mt-2">Repurpose your content into any format instantly</p>
          </a>
          <a href="https://emailsubject-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-orange-400/50 transition-all">
            <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">EmailSubject AI</div>
            <p className="text-xs text-slate-400 mt-2">Test &amp; score email subject lines with AI</p>
          </a>
        </div>
      </section>
    </main>
  );
}
