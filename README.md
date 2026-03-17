# ThumbnailForge AI

AI-powered YouTube thumbnail generator for creators.

## What it does

- Paste a video title or topic
- Generate 4 thumbnail variants
- Resize to 1280x720 PNG
- Apply a subtle `Made with ThumbnailForge` watermark for free-tier generations
- Show pricing for Free / Pro / Agency plans
- Includes a starter blog at `/blog`

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS 4
- OpenAI Images API (`dall-e-3`)
- Sharp for resize + watermarking

## Required environment variables

```bash
OPENAI_API_KEY=your_openai_api_key
```

## Local development

```bash
npm install
npm run dev
```

If npm is unavailable on this machine, copy or install dependencies in a network-enabled environment.

## Deploying to Vercel

1. Import the repo into Vercel
2. Set `OPENAI_API_KEY` in Project Settings → Environment Variables
3. Deploy

## Notes

- The free-tier limiter uses an in-memory store keyed by IP/cookie. It is suitable for a demo, not production billing enforcement.
- The current implementation ships the free experience first, so generated thumbnails are watermarked by default.
- For production paid tiers, move usage tracking and plan entitlements to a durable backend store.
