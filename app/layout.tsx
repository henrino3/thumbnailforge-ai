import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
      </body>
    </html>
  );
}
