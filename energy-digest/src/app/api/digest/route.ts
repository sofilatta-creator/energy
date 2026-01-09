import { NextResponse } from "next/server";

import { fetchLatestDigest } from "@/lib/db/queries";
import { SAMPLE_DIGEST } from "@/lib/news/sample-data";

export const runtime = "nodejs";

export async function GET() {
  const digest = (await fetchLatestDigest()) ?? SAMPLE_DIGEST;
  const stats = {
    energyItems: digest.items.filter((item) => item.category === "energy").length,
    aiItems: digest.items.filter((item) => item.category === "ai").length,
    latestPublishedAt: digest.items[0]?.publishedAt ?? digest.digestDate,
  };

  return NextResponse.json({ digest, stats });
}
