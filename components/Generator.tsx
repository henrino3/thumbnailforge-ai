"use client";

import Link from "next/link";
import { Download, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type GeneratedImage = {
  id: string;
  prompt: string;
  image: string;
  watermarked: boolean;
};

type GenerateResponse = {
  images: GeneratedImage[];
  remaining: number;
  limit: number;
  watermarked: boolean;
};

const sampleTitles = [
  "I tested every viral YouTube growth hack for 30 days",
  "The beginner AI tools I wish I knew before starting my channel",
  "I rebuilt my morning routine using advice from millionaires",
];

const previewConcepts = [
  {
    label: "Shock reaction",
    hook: "One clear face, huge contrast, visible stakes",
    gradient: "from-orange-500 via-red-600 to-slate-950",
  },
  {
    label: "Before / after",
    hook: "Split-screen transformation with instant context",
    gradient: "from-cyan-400 via-blue-700 to-slate-950",
  },
  {
    label: "Curiosity gap",
    hook: "A strange object and one obvious question",
    gradient: "from-yellow-300 via-orange-600 to-black",
  },
  {
    label: "Clean authority",
    hook: "Minimal focal point, premium creator aesthetic",
    gradient: "from-violet-400 via-fuchsia-700 to-slate-950",
  },
];

function track(eventName: string, props?: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.plausible !== "function") return;
  window.plausible(eventName, props ? { props } : undefined);
}

export default function Generator() {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);

  const canGenerate = useMemo(() => title.trim().length > 6 && !loading, [loading, title]);

  useEffect(() => {
    if (remaining > 1) return;

    track("paywall_seen", {
      location: "thumbnail_generator",
      remaining: String(remaining),
    });
  }, [remaining]);

  async function generateFromTitle(nextTitle: string, source: "form" | "example") {
    const trimmedTitle = nextTitle.trim();
    if (trimmedTitle.length <= 6 || loading) return;

    setTitle(trimmedTitle);
    setLoading(true);
    setError(null);

    track("generate_intent", {
      location: "thumbnail_generator",
      source,
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      const data = (await response.json()) as GenerateResponse | { error: string; remaining?: number };
      if (!response.ok || !("images" in data)) {
        const nextRemaining = typeof data.remaining === "number" ? data.remaining : remaining;
        setRemaining(nextRemaining);

        if (response.status === 429) {
          track("generation_limit_hit", {
            location: "thumbnail_generator",
            remaining: String(nextRemaining),
          });
        } else {
          track("generation_error", {
            location: "thumbnail_generator",
            reason: response.status >= 500 ? "server" : "validation",
          });
        }

        throw new Error((data as {error?: string}).error || "Something went wrong generating thumbnails.");
      }

      setImages(data.images);
      setRemaining(data.remaining);
      track("generation_success", {
        location: "thumbnail_generator",
        remaining: String(data.remaining),
        variants: String(data.images.length),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating thumbnails.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateFromTitle(title, "form");
  }

  return (
    <section id="generator" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-200">
              <Sparkles className="h-4 w-4" /> AI thumbnail concept engine
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              YouTube Thumbnails in <span className="text-orange-400">5 Seconds</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300 md:text-xl">
              Paste a video title. Get four bold thumbnail directions. Download creator-ready PNGs without wrestling Canva for 30 minutes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["4 variants", "Every prompt generates four different thumbnail angles."],
              ["1280×720", "Creator-ready PNG exports sized for YouTube."],
              ["3 free/day", "Free plan includes a subtle ThumbnailForge watermark."],
            ].map(([label, copy]) => (
              <div key={label} className="glass-panel rounded-2xl p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">{label}</p>
                <p className="mt-2 text-sm text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Free tier remaining</p>
              <p className="mt-2 text-3xl font-semibold text-white">{remaining}/3 today</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-slate-300">
              <div>Best for</div>
              <div className="font-semibold text-white">Fast concept testing</div>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={onSubmit} data-analytics-submit-event="generate_submit" data-analytics-location="thumbnail_generator" data-analytics-label="thumbnail_generation">
            <label className="block text-sm font-medium text-slate-200" htmlFor="title">
              Video title or topic
            </label>
            <textarea
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. I tried posting on YouTube every day for 30 days"
              className="min-h-36 w-full rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/70"
            />
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-white">Not sure what to paste?</p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-300">Use a proven hook</p>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Fastest first win</p>
                  <p className="mt-2 text-sm font-semibold text-white">Generate a real example now, then swap in your title after you see the output.</p>
                  <button
                    type="button"
                    onClick={() => void generateFromTitle(sampleTitles[0], "example")}
                    disabled={loading}
                    data-analytics-event="cta_click"
                    data-analytics-location="thumbnail_generator"
                    data-analytics-label="generate_example_thumbnail"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate the example
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleTitles.map((sampleTitle, index) => (
                    <button
                      key={sampleTitle}
                      type="button"
                      onClick={() => {
                        setTitle(sampleTitle);
                        track("sample_title_click", {
                          location: "thumbnail_generator",
                          sample: String(index + 1),
                        });
                      }}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:border-orange-400/50 hover:bg-orange-500/10 hover:text-white"
                    >
                      {sampleTitle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="submit"
              data-analytics-event="cta_click"
              data-analytics-location="thumbnail_generator"
              data-analytics-label="generate_4_thumbnail_variants"
              disabled={!canGenerate}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 text-base font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? "Generating thumbnails..." : "Generate 4 thumbnail variants"}
            </button>
            <p className="text-center text-xs text-slate-400">
              No signup needed for your first 3 generations today. You will get 4 concept directions to compare.
            </p>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>

          {remaining <= 1 ? (
            <div className="mt-6 rounded-3xl border border-orange-400/25 bg-orange-500/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Ready for more testing?</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Upgrade when you want watermark-free iterations on demand.</h3>
              <p className="mt-2 text-sm text-slate-300">
                Pro is built for creators who want to compare more ideas per upload without hitting the daily cap.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#pricing"
                  data-analytics-event="cta_click"
                  data-analytics-location="generator_paywall"
                  data-analytics-label="view_pricing_after_limit"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  View pricing
                </Link>
                <Link
                  href="mailto:hello@thumbnailforge.ai?subject=ThumbnailForge%20Pro"
                  data-analytics-event="cta_click"
                  data-analytics-location="generator_paywall"
                  data-analytics-label="contact_sales_after_limit"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask about Pro
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {images.length > 0
          ? images.map((image, index) => (
              <article key={image.id} className="glass-panel overflow-hidden rounded-[1.75rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image} alt={`Generated thumbnail variant ${index + 1}`} className="aspect-[16/9] w-full object-cover" />
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Variant {index + 1}</p>
                    <p className="mt-2 text-sm text-slate-300">{image.prompt}</p>
                  </div>
                  <a
                    href={image.image}
                    download={`thumbnailforge-${index + 1}.png`}
                    data-analytics-event="download_click"
                    data-analytics-location="thumbnail_results"
                    data-analytics-label={`download_variant_${index + 1}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" /> Download PNG
                  </a>
                </div>
              </article>
            ))
          : previewConcepts.map((concept, index) => (
              <article key={concept.label} className="glass-panel overflow-hidden rounded-[1.75rem]">
                <div className={`relative aspect-[16/9] bg-gradient-to-br ${concept.gradient} p-5`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(0,0,0,0.45),transparent_30%)]" />
                  <div className="relative flex h-full flex-col justify-between">
                    <p className="w-fit rounded-full bg-black/45 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/90">
                      Example {index + 1}
                    </p>
                    <div>
                      <p className="max-w-[11rem] text-3xl font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-lg">
                        {concept.label}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">What the AI explores</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{concept.hook}</p>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
