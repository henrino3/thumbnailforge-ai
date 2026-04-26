import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Analytics from "@/components/Analytics";

const siteUrl = "https://thumbnailforge-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ThumbnailForge AI — YouTube Thumbnails in 5 Seconds",
    template: "%s | ThumbnailForge AI",
  },
  description:
    "Turn a video title into four click-worthy YouTube thumbnail concepts in seconds. Built for creators who need better thumbnails fast.",
  openGraph: {
    title: "ThumbnailForge AI",
    description:
      "Generate four YouTube thumbnail concepts in seconds, then download creator-ready 1280x720 PNGs.",
    url: siteUrl,
    siteName: "ThumbnailForge AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThumbnailForge AI",
    description:
      "YouTube Thumbnails in 5 Seconds — four AI thumbnail variants from one title.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <div className="mx-auto min-h-screen max-w-7xl px-5 py-5 md:px-8 lg:px-10">
          <nav className="glass-panel mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full px-5 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              ThumbnailForge AI
            </Link>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <Link href="/#generator" className="transition hover:text-white">Generator</Link>
              <Link href="/#pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/blog" className="transition hover:text-white">Blog</Link>
            </div>
          </nav>
          {children}
        </div>
        <footer className="border-t border-white/10 mt-12">
          <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300 mb-4">More AI Tools from Money Z</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <a href="https://websitereviewai.com" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-orange-400/50 transition">
                <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">SiteInsight AI</div>
                <p className="text-xs text-slate-400 mt-1">Get your website reviewed by AI</p>
              </a>
              <a href="https://modelhub-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-orange-400/50 transition">
                <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">ModelHub AI</div>
                <p className="text-xs text-slate-400 mt-1">Compare &amp; chat with all AI models</p>
              </a>
              <a href="https://contentmorph-ai-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-orange-400/50 transition">
                <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">ContentMorph AI</div>
                <p className="text-xs text-slate-400 mt-1">Repurpose content into any format</p>
              </a>
              <a href="https://emailsubject-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-orange-400/50 transition">
                <div className="font-semibold text-white group-hover:text-orange-300 transition-colors text-sm">EmailSubject AI</div>
                <p className="text-xs text-slate-400 mt-1">Test email subject lines with AI</p>
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
              <p>© 2026 ThumbnailForge AI. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">Built with ✨ by Money Z</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
