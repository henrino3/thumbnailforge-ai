import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { consumeGeneration, getRemainingGenerations, getRequestKey } from "@/lib/rate-limit";
import { postProcessThumbnail, toDataUrl } from "@/lib/thumbnail";

const IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
const FREE_LIMIT = 3;

type OpenAIImageResponse = {
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: {
    message?: string;
  };
};

function buildVariantPrompt(title: string, angle: string) {
  return [
    `Create a high-CTR YouTube thumbnail for this video idea: ${title}.`,
    `Creative direction: ${angle}.`,
    "Style: bold, cinematic, modern, punchy, creator-first, high contrast, mobile-readable, clean composition.",
    "Output should look like a polished YouTube thumbnail concept with one clear focal point.",
    "No text, no watermark, no borders, no UI chrome.",
  ].join(" ");
}

async function generateOne(prompt: string) {
  const response = await fetch(IMAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size: "1792x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });

  const payload = (await response.json()) as OpenAIImageResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "OpenAI image generation failed.");
  }

  const result = payload.data?.[0];
  if (result?.b64_json) {
    return Buffer.from(result.b64_json, "base64");
  }

  if (result?.url) {
    const imageResponse = await fetch(result.url);
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error("OpenAI returned no image data.");
}

export async function POST(request: Request) {
  try {
    const { title } = (await request.json()) as { title?: string };
    if (!title || title.trim().length < 6) {
      return NextResponse.json({ error: "Please enter a more specific video title or topic." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured yet. Add it in Vercel project settings to enable generation." },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    let visitorId = cookieStore.get("thumbnailforge_id")?.value;
    if (!visitorId) {
      visitorId = randomUUID();
    }

    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || null;
    const requestKey = getRequestKey(ip, visitorId);
    const allowance = consumeGeneration(requestKey);

    if (!allowance.allowed) {
      return NextResponse.json(
        { error: "Free plan limit reached for today. Upgrade to Pro for more generations.", remaining: 0 },
        { status: 429 },
      );
    }

    const angles = [
      "dramatic emotional reaction with bold lighting",
      "clean minimal composition with one striking object",
      "high-energy transformation before-versus-after concept",
      "curiosity-driven scene with cinematic tension and contrast",
    ];

    const results = await Promise.all(
      angles.map(async (angle, index) => {
        const variantPrompt = buildVariantPrompt(title.trim(), angle);
        const rawImage = await generateOne(variantPrompt);
        const processed = await postProcessThumbnail(rawImage, true);

        return {
          id: `${index + 1}`,
          prompt: angle,
          image: toDataUrl(processed),
          watermarked: true,
        };
      }),
    );

    const response = NextResponse.json({
      images: results,
      remaining: allowance.remaining,
      limit: FREE_LIMIT,
      watermarked: true,
    });

    response.cookies.set("thumbnailforge_id", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong while generating thumbnails.",
        remaining: getRemainingGenerations("anonymous"),
      },
      { status: 500 },
    );
  }
}
