import os
from pathlib import Path

root = Path('/Users/henrymascot/.openclaw-zora/workspace/businesses/moneyz/sites/contentmorph-ai')

files = {
    "lib/types.ts": """export const CONTENT_TYPES = ["Blog", "Podcast Transcript", "Video Script", "Notes"] as const;
export const TONES = ["Professional", "Casual", "Witty/Humorous", "Educational"] as const;
export const OUTPUT_FORMATS = [
  "Twitter Thread",
  "LinkedIn Post",
  "Instagram Caption",
  "Newsletter Section",
  "TikTok Script",
  "YouTube Shorts Script",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type Tone = (typeof TONES)[number];
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export type Plan = "free" | "pro" | "agency";

export type RepurposeResult = {
  format: OutputFormat;
  content: string;
  watermarked?: boolean;
};
""",
    "lib/plans.ts": """import type { Plan } from "@/lib/types";

export const PLAN_RULES: Record<Plan, {
  name: string;
  price: string;
  description: string;
  charLimit: number;
  monthlyRepurposes: number | "unlimited";
  maxFormats: number;
  watermark: boolean;
  priority: boolean;
  features: string[];
}> = {
  free: {
    name: "Free",
    price: "$0",
    description: "For creators testing AI repurposing before they commit.",
    charLimit: 10000,
    monthlyRepurposes: 5,
    maxFormats: 3,
    watermark: true,
    priority: false,
    features: ["5 repurposes/month", "Up to 3 formats/request", "10,000 character limit", "Watermarked outputs"],
  },
  pro: {
    name: "Pro",
    price: "$15/mo",
    description: "For solo operators who need fast, polished cross-platform drafts.",
    charLimit: 50000,
    monthlyRepurposes: "unlimited",
    maxFormats: 6,
    watermark: false,
    priority: true,
    features: ["Unlimited repurposes", "All 6 output formats", "50,000 character limit", "No watermark", "Priority processing"],
  },
  agency: {
    name: "Agency",
    price: "$39/mo",
    description: "For teams handling multiple brands, channels, and publishing motions.",
    charLimit: 50000,
    monthlyRepurposes: "unlimited",
    maxFormats: 6,
    watermark: false,
    priority: true,
    features: ["Everything in Pro", "White-label outputs", "Bulk processing up to 10 pieces", "API access", "Custom templates"],
  },
};
""",
    "lib/stripe.ts": """import Stripe from "stripe";

export const STRIPE_PRODUCTS = {
  pro: {
    name: "ContentMorph AI Pro",
    amount: 1500,
    description: "$15/month for unlimited content repurposing.",
  },
  agency: {
    name: "ContentMorph AI Agency",
    amount: 3900,
    description: "$39/month for agencies, white-label outputs, and bulk workflows.",
  },
} as const;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(key);
}

export async function ensureStripePrice(plan: "pro" | "agency") {
  const stripe = getStripeClient();
  const metadataKey = `contentmorph_${plan}`;

  const products = await stripe.products.list({ active: true, limit: 100 });
  let product = products.data.find((item) => item.metadata?.contentmorph_plan === metadataKey);

  if (!product) {
    product = await stripe.products.create({
      name: STRIPE_PRODUCTS[plan].name,
      description: STRIPE_PRODUCTS[plan].description,
      metadata: { contentmorph_plan: metadataKey },
    });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find((item) => item.unit_amount === STRIPE_PRODUCTS[plan].amount && item.recurring?.interval === "month");

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: STRIPE_PRODUCTS[plan].amount,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { contentmorph_plan: metadataKey },
    });
  }

  return { product, price };
}
""",
    "lib/model-router.ts": """const FREE_MODEL = 'zai/glm-5';
const FREE_FALLBACK = 'minimax/m2.5';
const PRO_MODEL = 'openai-codex/gpt-5.4';
const PRO_FALLBACK_1 = 'anthropic/claude-sonnet';
const PRO_FALLBACK_2 = 'zai/glm-5';

import type { OutputFormat, Plan, Tone, ContentType, RepurposeResult } from "@/lib/types";

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MINIMAX_ENDPOINT = "https://api.minimaxi.chat/v1/text/chatcompletion_v2";

function buildPrompt({ content, contentType, tone, format }: { content: string; contentType: ContentType; tone: Tone; format: OutputFormat; }) {
  return `You are ContentMorph AI, an expert content repurposing assistant.
Transform the source ${contentType.toLowerCase()} into a ${format}.
Tone: ${tone}.

Rules by format:
- Twitter Thread: create a strong hook and a numbered thread of concise tweets.
- LinkedIn Post: professional, scannable, thoughtful, include tasteful emojis and 3-5 hashtags.
- Instagram Caption: engaging, emoji-forward, concise paragraphs, include relevant hashtags.
- Newsletter Section: casual, high-signal, scannable, with a short headline and bullet points if useful.
- TikTok Script: hook + 3 punchy points + CTA.
- YouTube Shorts Script: hook + fast content beats + CTA.

Output only the final content. No preamble.

Source content:
${content}`;
}

async function sendZhipu(prompt: string) {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error("Missing ZAI_API_KEY");

  const response = await fetch(ZHIPU_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-5",
      messages: [
        { role: "system", content: "You produce polished, platform-native repurposed content." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) throw new Error(`Zhipu failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "No response returned from Zhipu.";
}

async function sendMiniMax(prompt: string) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error("Missing MINIMAX_API_KEY");

  const response = await fetch(MINIMAX_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "MiniMax-Text-01",
      messages: [
        { role: "system", content: "You produce polished, platform-native repurposed content." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      tokens_to_generate: 2048,
    }),
  });

  if (!response.ok) throw new Error(`MiniMax failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data?.reply || data?.choices?.[0]?.message?.content || "No response returned from MiniMax.";
}

export async function generateRepurposedOutputs({
  plan,
  content,
  contentType,
  tone,
  formats,
}: {
  plan: Plan;
  content: string;
  contentType: ContentType;
  tone: Tone;
  formats: OutputFormat[];
}): Promise<RepurposeResult[]> {
  const prompts = formats.map((format) => ({ format, prompt: buildPrompt({ content, contentType, tone, format }) }));

  return Promise.all(prompts.map(async ({ format, prompt }) => {
    // Simplified router: just try Zhipu then MiniMax for now. Add OpenAI later.
    const candidates = [() => sendZhipu(prompt), () => sendMiniMax(prompt)];

    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        const content = await candidate();
        return { format, content, watermarked: plan === "free" };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("All model routes failed.");
  }));
}

export { FREE_MODEL, FREE_FALLBACK, PRO_MODEL, PRO_FALLBACK_1, PRO_FALLBACK_2 };
""",
    "lib/blog.ts": """import fs from "node:fs";
import path from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  author: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, metaBlock, content] = match;
  const data = Object.fromEntries(
    metaBlock
      .split("\\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return [key.trim(), rest.join(":").trim().replace(/^"|"$/g, "")];
      }),
  );
  return { data, content };
}

export function getAllPosts(): BlogPost[] {
  return fs.readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        title: String(data.title || slug),
        description: String(data.description || ""),
        date: String(data.date || ""),
        readTime: String(data.readTime || "6 min read"),
        author: String(data.author || "ContentMorph AI"),
        content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}
""",
    "components/Hero.tsx": """import Link from "next/link";

export default function Hero() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-10">
      <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
        AI repurposing for busy creators and lean teams
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
            Turn one piece of content into six platform-ready assets in minutes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Paste a blog post, transcript, script, or rough notes. ContentMorph AI rewrites it into sharp Twitter threads, polished LinkedIn posts, caption-ready Instagram copy, and short-form video scripts.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/app" className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 font-medium text-white transition hover:opacity-90">
              Launch app
            </Link>
            <Link href="/pricing" className="rounded-2xl border border-white/10 px-6 py-3 font-medium text-slate-100 transition hover:border-violet-400">
              View pricing
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
            <span>⚡ 6 formats</span>
            <span>🧠 Tone-aware rewriting</span>
            <span>📱 Platform-native structure</span>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Example output stack</p>
          <div className="mt-6 space-y-4">
            {[
              ["Twitter Thread", "1/ Most creators don't have a content problem. They have a repurposing problem..."],
              ["LinkedIn Post", "Your next content win probably isn't creating more. It's squeezing more signal from what you already made. ✨"],
              ["TikTok Script", "Hook: You do NOT need more ideas — you need more formats..."],
            ].map(([title, preview]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <span className="rounded-full border border-violet-400/20 px-3 py-1 text-xs text-violet-200">Ready</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{preview}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
""",
    "components/InputSection.tsx": """"use client";

import { CONTENT_TYPES, TONES, type ContentType, type Tone } from "@/lib/types";

export default function InputSection({
  content,
  onContentChange,
  contentType,
  onContentTypeChange,
  tone,
  onToneChange,
  charLimit,
}: {
  content: string;
  onContentChange: (value: string) => void;
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
  tone: Tone;
  onToneChange: (value: Tone) => void;
  charLimit: number;
}) {
  const used = content.length;
  const overLimit = used > charLimit;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">Source content</h2>
          <p className="mt-2 text-sm text-slate-400">Paste a blog post, transcript, script, or rough notes.</p>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm ${overLimit ? "bg-rose-500/10 text-rose-200" : "bg-white/5 text-slate-300"}`}>
          {used.toLocaleString()} / {charLimit.toLocaleString()} chars
        </div>
      </div>

      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Paste your content here..."
        className="mt-6 min-h-[280px] w-full rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Content type</span>
          <select value={contentType} onChange={(event) => onContentTypeChange(event.target.value as ContentType)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-violet-400">
            {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Tone</span>
          <select value={tone} onChange={(event) => onToneChange(event.target.value as Tone)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-violet-400">
            {TONES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
""",
    "components/FormatSelector.tsx": """"use client";

import { OUTPUT_FORMATS, type OutputFormat } from "@/lib/types";

export default function FormatSelector({
  selected,
  onToggle,
  maxFormats,
}: {
  selected: OutputFormat[];
  onToggle: (value: OutputFormat) => void;
  maxFormats: number;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">Output formats</h2>
          <p className="mt-2 text-sm text-slate-400">Choose up to {maxFormats} format{maxFormats > 1 ? "s" : ""} on your current plan.</p>
        </div>
        <div className="text-sm text-slate-400">{selected.length}/{maxFormats} selected</div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {OUTPUT_FORMATS.map((format) => {
          const active = selected.includes(format);
          const disabled = !active && selected.length >= maxFormats;
          return (
            <button
              key={format}
              type="button"
              onClick={() => !disabled && onToggle(format)}
              className={`rounded-3xl border p-5 text-left transition ${active ? "border-violet-400 bg-violet-500/10 text-white" : "border-white/10 bg-slate-950/50 text-slate-300"} ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-violet-300"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{format}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${active ? "bg-violet-400/20 text-violet-100" : "bg-white/5 text-slate-400"}`}>
                  {active ? "Selected" : "Add"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
""",
    "components/OutputCard.tsx": """"use client";

import { Copy, RefreshCw } from "lucide-react";
import type { OutputFormat } from "@/lib/types";

export default function OutputCard({
  title,
  content,
  onRegenerate,
  watermarked,
}: {
  title: OutputFormat;
  content: string;
  onRegenerate: () => void;
  watermarked?: boolean;
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {watermarked ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-violet-200">Free plan watermark</p> : null}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigator.clipboard.writeText(content)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-violet-400">
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button onClick={onRegenerate} className="inline-flex items-center gap-2 rounded-2xl bg-violet-500/15 px-4 py-2 text-sm text-violet-100 hover:bg-violet-500/25">
            <RefreshCw className="h-4 w-4" /> Regenerate
          </button>
        </div>
      </div>
      <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">{content}</pre>
    </article>
  );
}
""",
    "components/Pricing.tsx": """import Link from "next/link";
import { PLAN_RULES } from "@/lib/plans";

const ORDER = ["free", "pro", "agency"] as const;

export default function Pricing() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {ORDER.map((key) => {
        const plan = PLAN_RULES[key];
        const highlighted = key === "pro";
        return (
          <article key={key} className={`rounded-[2rem] border p-6 ${highlighted ? "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              </div>
              {highlighted ? <span className="rounded-full bg-violet-400/20 px-3 py-1 text-xs text-violet-100">Popular</span> : null}
            </div>
            <div className="mt-6 text-4xl font-semibold text-white">{plan.price}</div>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <Link href={key === "free" ? "/app" : `/pricing?plan=${key}`} className={`mt-8 inline-flex rounded-2xl px-5 py-3 text-sm font-medium ${highlighted ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white" : "border border-white/10 text-white"}`}>
              {key === "free" ? "Start free" : `Choose ${plan.name}`}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
""",
    "components/Footer.tsx": """import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
        <div>© 2026 ContentMorph AI. One idea, many channels.</div>
        <div className="flex gap-4">
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/app">App</Link>
        </div>
      </div>
    </footer>
  );
}
""",
    "app/layout.tsx": """import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ContentMorph AI",
  description: "AI-powered content repurposing for Twitter, LinkedIn, Instagram, newsletters, TikTok, and YouTube Shorts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-10 lg:px-12">
          <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
            <Link href="/" className="text-lg font-semibold text-white">ContentMorph AI</Link>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <Link href="/app">App</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </nav>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
""",
    "app/page.tsx": """import Link from "next/link";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";

const features = [
  ["Paste once, publish everywhere", "Start with a blog post, podcast transcript, video script, or raw notes and turn it into social-ready variants."],
  ["Tone-aware outputs", "Switch between professional, casual, witty, and educational styles without rewriting from scratch."],
  ["Built for modern channels", "Generate Twitter threads, LinkedIn posts, Instagram captions, newsletter snippets, TikTok scripts, and YouTube Shorts copy."],
];

const faqs = [
  ["What can I paste into ContentMorph AI?", "Blog posts, meeting notes, transcripts, scripts, or even rough bullet points. If it has signal, we can reshape it."],
  ["Does the free plan have limits?", "Yes. Free includes 5 repurposes per month, up to 3 output formats per request, a 10,000 character cap, and watermarked outputs."],
  ["What do I get with Pro?", "Unlimited repurposes, all 6 formats, a 50,000 character limit, no watermark, and priority processing."],
  ["Is there an agency option?", "Yes. Agency adds white-label outputs, bulk processing up to 10 pieces, API access, and custom templates."],
];

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map(([title, body]) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">From one source to a full content stack.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Paste your source"],
              ["2", "Pick formats + tone"],
              ["3", "Generate, copy, download"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <div className="text-3xl font-semibold text-violet-200">{step}</div>
                <p className="mt-2 text-sm text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Simple plans for creators, operators, and agencies</h2>
          </div>
          <Link href="/pricing" className="text-sm text-slate-300 hover:text-white">View full pricing →</Link>
        </div>
        <Pricing />
      </section>

      <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Questions founders and creators usually ask</h2>
        </div>
        <div className="mt-8 grid gap-4">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <h3 className="text-lg font-semibold text-white">{question}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
""",
    "app/app/page.tsx": """"use client";

import { useMemo, useState } from "react";
import InputSection from "@/components/InputSection";
import FormatSelector from "@/components/FormatSelector";
import OutputCard from "@/components/OutputCard";
import { PLAN_RULES } from "@/lib/plans";
import { OUTPUT_FORMATS, type ContentType, type OutputFormat, type Plan, type RepurposeResult, type Tone } from "@/lib/types";

const DEFAULT_CONTENT = `Most creators think they need to publish more. They don't. They need to repurpose better.

If you already have a podcast, blog, internal memo, webinar, or meeting notes, you probably have enough raw material for a week of content. The bottleneck is translation: taking one idea and shaping it for the language of each platform.

That is what ContentMorph AI is built to do.`;

export default function AppPage() {
  const [plan, setPlan] = useState<Plan>("free");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [contentType, setContentType] = useState<ContentType>("Blog");
  const [tone, setTone] = useState<Tone>("Professional");
  const [formats, setFormats] = useState<OutputFormat[]>(OUTPUT_FORMATS.slice(0, 3));
  const [results, setResults] = useState<RepurposeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planRules = useMemo(() => PLAN_RULES[plan], [plan]);

  function toggleFormat(format: OutputFormat) {
    setFormats((current) =>
      current.includes(format)
        ? current.filter((entry) => entry !== format)
        : current.length < planRules.maxFormats
          ? [...current, format]
          : current,
    );
  }

  async function generate(targetFormats = formats) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, content, contentType, tone, formats: targetFormats }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate outputs.");
      setResults((current) => {
        const incoming = data.results as RepurposeResult[];
        const merged = current.filter((item) => !incoming.some((next) => next.format === item.format));
        return [...merged, ...incoming];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function downloadAll(ext: "txt" | "md") {
    const body = results.map((item) => `# ${item.format}\\n\\n${item.content}`).join("\\n\\n---\\n\\n");
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contentmorph-outputs.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Main app</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Repurpose one piece of content into a full channel pack.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["free", "pro", "agency"] as Plan[]).map((entry) => (
              <button
                key={entry}
                onClick={() => {
                  setPlan(entry);
                  const max = PLAN_RULES[entry].maxFormats;
                  setFormats((current) => current.slice(0, max));
                }}
                className={`rounded-full px-4 py-2 text-sm ${plan === entry ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white" : "border border-white/10 text-slate-300"}`}
              >
                {PLAN_RULES[entry].name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <InputSection
        content={content}
        onContentChange={setContent}
        contentType={contentType}
        onContentTypeChange={setContentType}
        tone={tone}
        onToneChange={setTone}
        charLimit={planRules.charLimit}
      />

      <FormatSelector selected={formats} onToggle={toggleFormat} maxFormats={planRules.maxFormats} />

      <section className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <button
          onClick={() => generate()}
          disabled={loading || !content.trim() || !formats.length}
          className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate outputs"}
        </button>
        <button onClick={() => downloadAll("txt")} disabled={!results.length} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 disabled:opacity-40">Download .txt</button>
        <button onClick={() => downloadAll("md")} disabled={!results.length} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 disabled:opacity-40">Download .md</button>
        <p className="text-sm text-slate-400">{planRules.watermark ? "Free outputs include a subtle watermark line." : "Paid outputs are watermark-free."}</p>
      </section>

      {error ? <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {results.map((result) => (
          <OutputCard
            key={result.format}
            title={result.format}
            content={result.content}
            watermarked={result.watermarked}
            onRegenerate={() => generate([result.format])}
          />
        ))}
      </section>
    </main>
  );
}
""",
    "app/pricing/page.tsx": """import Pricing from "@/components/Pricing";

export default function PricingPage() {
  return (
    <main className="space-y-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Choose the plan that matches your publishing engine.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Free is great for testing. Pro unlocks your full workflow. Agency is for teams who need white-label outputs, bulk processing, and API access.
        </p>
      </section>
      <Pricing />
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Stripe checkout is configured for test mode. If STRIPE_SECRET_KEY is present, the setup route can create products and prices automatically.
      </section>
    </main>
  );
}
""",
    "app/blog/page.tsx": """import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Blog</p>
        <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Content strategy, repurposing systems, and AI workflows that actually save time.</h1>
      </section>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">{post.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm text-violet-300 hover:text-violet-200">Read article →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
""",
    "app/blog/[slug]/page.tsx": """import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const blocks = post.content.split("\\n\\n").map((block) => block.trim()).filter(Boolean);

  return (
    <main className="max-w-4xl">
      <Link href="/blog" className="text-sm text-slate-300 hover:text-white">← Back to blog</Link>
      <article className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">{post.description}</p>
        <div className="prose-content mt-10 max-w-none">
          {blocks.map((block) => block.startsWith("## ") ? (
            <h2 key={block}>{block.replace("## ", "")}</h2>
          ) : block.startsWith("- ") ? (
            <ul key={block}>{block.split("\\n").map((item) => <li key={item}>{item.replace(/^- /, "")}</li>)}</ul>
          ) : (
            <p key={block}>{block}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
""",
    "app/api/repurpose/route.ts": """import { NextResponse } from "next/server";
import { generateRepurposedOutputs } from "@/lib/model-router";
import { PLAN_RULES } from "@/lib/plans";
import type { OutputFormat, Plan, Tone, ContentType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: Plan;
      content?: string;
      contentType?: ContentType;
      tone?: Tone;
      formats?: OutputFormat[];
    };

    const plan = body.plan ?? "free";
    const rules = PLAN_RULES[plan];
    const content = body.content?.trim() ?? "";
    const formats = (body.formats ?? []).slice(0, rules.maxFormats);

    if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });
    if (content.length > rules.charLimit) return NextResponse.json({ error: `Content exceeds the ${rules.charLimit.toLocaleString()} character limit for ${rules.name}.` }, { status: 400 });
    if (!formats.length) return NextResponse.json({ error: "Pick at least one format." }, { status: 400 });

    const results = await generateRepurposedOutputs({
      plan,
      content,
      contentType: body.contentType ?? "Blog",
      tone: body.tone ?? "Professional",
      formats,
    });

    return NextResponse.json({
      results: results.map((item) => ({
        ...item,
        content: item.watermarked ? `${item.content}\\n\\n— Generated with ContentMorph AI Free` : item.content,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to repurpose content." }, { status: 500 });
  }
}
""",
    "app/api/create-checkout/route.ts": """import { NextResponse } from "next/server";
import { ensureStripePrice, getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { plan?: "pro" | "agency" };
    const plan = body.plan;
    if (!plan || !["pro", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const stripe = getStripeClient();
    const { price } = await ensureStripePrice(plan);
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://contentmorph-ai.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/pricing?success=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create checkout session." }, { status: 500 });
  }
}
""",
    "app/api/stripe/setup/route.ts": """import { NextResponse } from "next/server";
import { ensureStripePrice } from "@/lib/stripe";

export async function POST() {
  try {
    const pro = await ensureStripePrice("pro");
    const agency = await ensureStripePrice("agency");

    return NextResponse.json({
      pro: { productId: pro.product.id, priceId: pro.price.id },
      agency: { productId: agency.product.id, priceId: agency.price.id },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to set up Stripe products." }, { status: 500 });
  }
}
""",
    "content/blog/content-repurposing-guide.mdx": """---
title: "How to Repurpose Content Like a Pro: The Ultimate Guide"
description: "A practical system for turning one strong idea into a full week of platform-specific content without sounding repetitive."
date: "2026-03-14"
readTime: "8 min read"
author: "ContentMorph AI"
---
If your team keeps saying you need to "make more content," pause for a second.

Usually the problem is not content volume. It is content distribution. You already have enough raw material. What you need is a better system for reshaping it.

## Start with a source worth stretching
The best source material is dense with insight. A founder memo, customer interview, webinar transcript, blog draft, or podcast episode works because it contains multiple angles.

## Build for platforms, not copy-paste
Repurposing is not cloning. Twitter wants momentum. LinkedIn wants framing. Instagram wants energy. Short-form video wants a hook within seconds.

## Pull out the atomic ideas
Before rewriting, identify the strongest ideas hiding in the source:
- One clear headline
- Three supporting takeaways
- One memorable quote or stat
- One direct call to action

## Create a repeatable transformation workflow
A strong workflow looks like this: source content → extract key ideas → map ideas to formats → rewrite to fit each platform.

## Use AI where it actually helps
AI is best at translation, variation, and speed. It should help you generate first drafts, not replace editorial judgment.

## Measure the best repurposing ratio
Track what works per source piece. Some blog posts become great threads. Some transcripts become great video scripts. The goal is not maximum output. The goal is maximum signal per idea.
""",
    "content/blog/social-media-growth.mdx": """---
title: "Why Content Repurposing is the Secret to Social Media Growth"
description: "The fastest way to grow on social platforms is not creating from zero every day. It is extracting more value from every good idea."
date: "2026-03-13"
readTime: "6 min read"
author: "ContentMorph AI"
---
The creators who look consistent are rarely creating every post from scratch.

They are running a system. One idea becomes a post, a thread, a caption, a reel script, and a newsletter snippet.

## Consistency gets easier when formats multiply
If one podcast gives you six assets, your weekly publishing pressure drops immediately.

## Repetition is not a bug
Audiences on different platforms do not all see the same content. Saying the same truth in different ways is how messages stick.

## Repurposing compounds learning
When you publish the same core idea in multiple formats, you learn faster:
- Which hook gets attention
- Which framing gets comments
- Which CTA gets clicks

## Growth comes from distribution density
A single insight shared once disappears. A single insight adapted across channels starts to feel like a brand.
""",
    "content/blog/ai-content-creation-2026.mdx": """---
title: "5 Ways AI is Transforming Content Creation in 2026"
description: "AI is no longer just a drafting tool. It is becoming the operating system behind faster, sharper, more adaptive content teams."
date: "2026-03-12"
readTime: "7 min read"
author: "ContentMorph AI"
---
AI in content creation is maturing. The novelty phase is over. The leverage phase is here.

## 1. Draft generation is becoming table stakes
Most teams now expect AI to turn rough notes into usable first drafts.

## 2. Repurposing is replacing one-and-done publishing
The strongest use case is turning one source into many channel-specific outputs.

## 3. Tone control is getting more precise
Teams want outputs that sound professional, casual, witty, or educational on demand.

## 4. Distribution workflows are getting shorter
The gap between having an idea and publishing across channels is shrinking fast.

## 5. Human judgment matters more, not less
As generation gets cheaper, differentiation shifts to taste, positioning, and editorial clarity.

The winning teams in 2026 will not be the ones using the most AI. They will be the ones using AI with the clearest system.
"""
}

for rel_path, content in files.items():
    p = root / rel_path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)

print("Files written successfully.")
