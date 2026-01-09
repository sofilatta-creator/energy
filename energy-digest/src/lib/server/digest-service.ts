import { fetchDigestHistory, fetchLatestDigest } from "@/lib/db/queries";
import { SAMPLE_DIGEST } from "@/lib/news/sample-data";
import { DigestHistoryEntry, DigestRecord } from "@/lib/news/types";

export async function getLatestDigest(): Promise<DigestRecord> {
  return (await fetchLatestDigest()) ?? SAMPLE_DIGEST;
}

export async function getDigestHistory(limit = 10): Promise<DigestHistoryEntry[]> {
  const history = await fetchDigestHistory(limit);
  if (history.length) return history;
  return [
    {
      digestDate: SAMPLE_DIGEST.digestDate,
      headline: SAMPLE_DIGEST.headline,
      itemCount: SAMPLE_DIGEST.items.length,
    },
  ];
}
