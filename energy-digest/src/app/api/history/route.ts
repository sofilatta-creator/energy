import { NextResponse } from "next/server";

import { fetchDigestHistory } from "@/lib/db/queries";
import { SAMPLE_DIGEST } from "@/lib/news/sample-data";

export const runtime = "nodejs";

export async function GET() {
  const history = await fetchDigestHistory(14);
  if (history.length === 0) {
    return NextResponse.json([
      {
        digestDate: SAMPLE_DIGEST.digestDate,
        headline: SAMPLE_DIGEST.headline,
        itemCount: SAMPLE_DIGEST.items.length,
      },
    ]);
  }
  return NextResponse.json(history);
}
