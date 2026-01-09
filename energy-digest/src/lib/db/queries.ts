import crypto from "node:crypto";

import { desc, eq, isNull } from "drizzle-orm";

import { isAiTopic } from "@/lib/news/topics";
import {
  DigestHistoryEntry,
  DigestItem,
  DigestRecord,
  NormalizedArticle,
  SourceDefinition,
  SummaryPayload,
} from "@/lib/news/types";

import { getDb } from "./client";
import { articles, digestItems, digests, sources, summaries } from "./schema";

const db = getDb();

export async function upsertSources(definitions: SourceDefinition[]) {
  if (!definitions.length) return 0;

  await db
    .insert(sources)
    .values(
      definitions.map((definition) => ({
        id: definition.id,
        name: definition.name,
        url: definition.url,
        type: definition.type,
        category: definition.category,
        region: definition.region,
        weight: definition.weight,
        topics: definition.topics,
        isActive: true,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing({ target: sources.id });

  return definitions.length;
}

export async function saveArticles(records: NormalizedArticle[]) {
  if (!records.length) return 0;

  const values = records.map((record) => ({
    id: record.hash,
    sourceId: record.sourceId,
    sourceName: record.sourceName,
    title: record.title,
    url: record.link,
    author: record.author,
    content: record.content,
    excerpt: record.contentSnippet,
    publishedAt: record.publishedAt,
    hash: record.hash,
    createdAt: new Date(),
  }));

  const result = await db
    .insert(articles)
    .values(values)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return result.length;
}

export async function saveSummaries(records: SummaryPayload[]) {
  if (!records.length) return 0;

  await db
    .insert(summaries)
    .values(
      records.map((record) => ({
        id: record.id,
        articleId: record.articleId,
        summary: record.summary,
        bullets: record.bullets,
        sentiment: record.sentiment,
        topic: record.topic,
        tags: record.tags,
        keywords: record.keywords,
        importanceScore: record.importanceScore,
        energyScore: record.energyScore,
        aiScore: record.aiScore,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing({ target: summaries.articleId });

  return records.length;
}

export async function createDigestFromSummaries(
  date: Date,
  headline: string,
  summaryText: string,
  summaryIds: string[],
) {
  if (!summaryIds.length) return null;

  const digestId = crypto.randomUUID();
  await db.insert(digests).values({
    id: digestId,
    digestDate: date,
    headline,
    summary: summaryText,
    createdAt: new Date(),
  });

  const summaryRows = await db.query.summaries.findMany({
    where: (summaries, { inArray }) => inArray(summaries.id, summaryIds),
    with: {
      article: true,
    },
  });

  const orderMap = new Map(summaryIds.map((id, index) => [id, index]));
  summaryRows.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  await db.insert(digestItems).values(
    summaryRows.map((summary, index) => ({
      id: crypto.randomUUID(),
      digestId,
      summaryId: summary.id,
      topic: summary.topic,
      category: isAiTopic(summary.topic as DigestItem["topic"]) ? "ai" : "energy",
      rank: index + 1,
    })),
  );

  const items: DigestItem[] = summaryRows.map((summary) => {
    if (!summary.article) {
      throw new Error(`Missing article relation for summary ${summary.id}`);
    }
    return {
      id: crypto.randomUUID(),
      topic: summary.topic as DigestItem["topic"],
      category: isAiTopic(summary.topic as DigestItem["topic"]) ? "ai" : "energy",
      sentiment: summary.sentiment as DigestItem["sentiment"],
      tags: summary.tags as string[],
      bullets: summary.bullets as string[],
      title: summary.article.title,
      source: summary.article.sourceName,
      link: summary.article.url,
      summary: summary.summary,
      publishedAt: new Date(summary.article.publishedAt),
      importanceScore: summary.importanceScore ?? 0,
    };
  });

  return {
    id: digestId,
    digestDate: date,
    headline,
    summary: summaryText,
    items,
  } as DigestRecord;
}

export async function fetchLatestDigest(): Promise<DigestRecord | null> {
  const digest = await db.query.digests.findFirst({
    orderBy: (digests, { desc: orderDesc }) => orderDesc(digests.digestDate),
    with: {
      items: {
        orderBy: (digestItems, { asc }) => asc(digestItems.rank),
        with: {
          summary: {
            with: {
              article: true,
            },
          },
        },
      },
    },
  });

  if (!digest) return null;

  const items: DigestItem[] = digest.items.map((item) => {
    const article = item.summary.article;
    if (!article) {
      throw new Error(`Missing article for summary ${item.summary.id}`);
    }
    return {
      id: item.id,
      topic: item.topic as DigestItem["topic"],
      category: item.category as DigestItem["category"],
      sentiment: item.summary.sentiment as DigestItem["sentiment"],
      tags: item.summary.tags as string[],
      bullets: item.summary.bullets as string[],
      title: article.title,
      source: article.sourceName,
      link: article.url,
      summary: item.summary.summary,
      publishedAt: new Date(article.publishedAt),
      importanceScore: item.summary.importanceScore ?? 0,
    };
  });

  return {
    id: digest.id,
    digestDate: new Date(digest.digestDate),
    headline: digest.headline,
    summary: digest.summary,
    items,
  };
}

export async function fetchDigestHistory(limit = 10): Promise<DigestHistoryEntry[]> {
  const history = await db
    .select()
    .from(digests)
    .orderBy(desc(digests.digestDate))
    .limit(limit);

  const itemCounts = await db
    .select({ digestId: digestItems.digestId, count: digestItems.id })
    .from(digestItems)
    .groupBy(digestItems.digestId);
  const countMap = new Map(itemCounts.map((row) => [row.digestId, row.count]));

  return history.map((entry) => ({
    digestDate: new Date(entry.digestDate),
    headline: entry.headline,
    itemCount: countMap.get(entry.id) ?? 0,
  }));
}

export async function fetchRecentSummaries(limit = 20) {
  const rows = await db.query.summaries.findMany({
    limit,
    orderBy: (summaries, { desc: orderDesc }) => orderDesc(summaries.createdAt),
    with: {
      article: true,
    },
  });

  return rows.map((row) => {
    if (!row.article) {
      throw new Error(`Missing article for summary ${row.id}`);
    }
    return {
      id: row.id,
      topic: row.topic as DigestItem["topic"],
      category: isAiTopic(row.topic as DigestItem["topic"]) ? "ai" : "energy",
      sentiment: row.sentiment as DigestItem["sentiment"],
      tags: row.tags as string[],
      bullets: row.bullets as string[],
      title: row.article.title,
      source: row.article.sourceName,
      link: row.article.url,
      summary: row.summary,
      publishedAt: new Date(row.article.publishedAt),
      importanceScore: row.importanceScore ?? 0,
    } satisfies DigestItem;
  });
}

export async function fetchArticlesPendingSummary(limit = 24): Promise<NormalizedArticle[]> {
  const rows = await db
    .select({ article: articles, summary: summaries })
    .from(articles)
    .leftJoin(summaries, eq(articles.id, summaries.articleId))
    .where(isNull(summaries.articleId))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return rows.map((row) => ({
    sourceId: row.article.sourceId,
    sourceName: row.article.sourceName,
    title: row.article.title,
    link: row.article.url,
    author: row.article.author ?? undefined,
    publishedAt: new Date(row.article.publishedAt),
    content: row.article.content ?? undefined,
    contentSnippet: row.article.excerpt ?? undefined,
    hash: row.article.id,
  }));
}
