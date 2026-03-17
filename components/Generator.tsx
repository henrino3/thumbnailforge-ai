"use client";

import { Download, LoaderCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

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

export default function Generator() {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);

  const canGenerate = useMemo(() => title.trim().length > 6 && !loading, [loading, title]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = (await response.json()) as GenerateResponse | { error: string; remaining?: number };
      if (!response.ok || !("images" in data)) {
        throw new Error((data as {error?: string}).error || "Something went wrong generating thumbnails.");
      }

      setImages(data.images);
      setRemaining(data.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating thumbnails.");
    } finally {
      setLoading(false);
    }
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

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
            <button
              type="submit"
              disabled={!canGenerate}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 text-base font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? "Generating thumbnails..." : "Generate 4 thumbnail variants"}
            </button>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" /> Download PNG
                  </a>
                </div>
              </article>
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-panel flex aspect-[16/9] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 text-sm text-slate-500">
                Variant {index + 1} appears here
              </div>
            ))}
      </div>
    </section>
  );
}
