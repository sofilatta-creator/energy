import { format } from "date-fns";

import {
  createDigestFromSummaries,
  fetchRecentSummaries,
  saveArticles,
  saveSummaries,
  upsertSources,
  fetchArticlesPendingSummary,
} from "@/lib/db/queries";

import { fetchArticlesFromSource } from "./fetchers";
import { SOURCE_DEFINITIONS } from "./sources";
import { createSummary } from "./summarizer";
import { DigestItem, PipelineResult, SummaryPayload } from "./types";

export function selectDigestItems(items: DigestItem[], maxPerTopic = 2, maxTotal = 12) {
  const sorted = [...items].sort((a, b) => b.importanceScore - a.importanceScore);
  const bucketed = new Map<string, DigestItem[]>();
  for (const item of sorted) {
    const bucket = bucketed.get(item.topic) ?? [];
    if (bucket.length >= maxPerTopic) continue;
    bucket.push(item);
    bucketed.set(item.topic, bucket);
  }
  return Array.from(bucketed.values())
    .flat()
    .slice(0, maxTotal)
    .sort((a, b) => a.topic.localeCompare(b.topic));
}

export function buildHeadline(items: DigestItem[]) {
  const topEnergy = items.find((item) => item.category === "energy");
  const topAi = items.find((item) => item.category === "ai");
  const parts = [] as string[];
  if (topEnergy) parts.push(topEnergy.title);
  if (topAi) parts.push(topAi.title);
  if (!parts.length) {
    return "Quiet day across energy transition and AI infrastructure";
  }
  return parts.map((part) => part.replace(/\.$/, "")).join(" · ");
}

export function buildDigestSummary(items: DigestItem[], date: Date) {
  const energyCount = items.filter((item) => item.category === "energy").length;
  const aiCount = items.length - energyCount;
  return `Daily brief for ${format(date, "MMM d")} — ${energyCount} energy grid & policy updates, ${aiCount} AI infrastructure highlights.`;
}

export async function runPipeline({ composeDigest = true } = {}): Promise<PipelineResult> {
  const windowHours = Number(process.env.INGESTION_WINDOW_HOURS ?? 72);
  const since = Date.now() - windowHours * 60 * 60 * 1000;

  await upsertSources(SOURCE_DEFINITIONS);

  const articleResults = await Promise.all(
    SOURCE_DEFINITIONS.map(async (source) => {
      try {
        const articles = await fetchArticlesFromSource(source);
        return articles
          .filter((article) => article.publishedAt.getTime() >= since)
          .map((article) => ({ ...article, sourceId: source.id }));
      } catch (error) {
        console.warn(`Failed to fetch ${source.name}:`, error);
        return [];
      }
    }),
  );

  const articles = articleResults.flat();
  const storedCount = await saveArticles(articles);

  const pendingArticles = await fetchArticlesPendingSummary(32);
  const summaries: SummaryPayload[] = [];
  for (const article of pendingArticles) {
    const source = SOURCE_DEFINITIONS.find((definition) => definition.id === article.sourceId);
    if (!source) continue;
    const summary = await createSummary(article, {
      sourceCategory: source.category,
      sourceWeight: source.weight,
    });
    summaries.push(summary);
  }

  const summaryCount = await saveSummaries(summaries);

  let digestId: string | undefined;
  if (composeDigest) {
    const recentSummaries = await fetchRecentSummaries(48);
    const selected = selectDigestItems(recentSummaries);
    if (selected.length) {
      const digest = await createDigestFromSummaries(
        new Date(),
        buildHeadline(selected),
        buildDigestSummary(selected, new Date()),
        selected.map((item) => item.id),
      );
      digestId = digest?.id;
    }
  }

  return {
    sourcesProcessed: SOURCE_DEFINITIONS.length,
    articlesFetched: articles.length,
    articlesStored: storedCount,
    summariesCreated: summaryCount,
    digestId,
  };
}
