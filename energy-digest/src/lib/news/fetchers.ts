import crypto from "node:crypto";

import Parser from "rss-parser";

import { SourceDefinition, NormalizedArticle } from "./types";

const rssParser = new Parser({
  timeout: 10000,
});

function createHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function fetchArticlesFromSource(
  source: SourceDefinition,
): Promise<NormalizedArticle[]> {
  if (source.type !== "rss") {
    throw new Error(`Unsupported source type: ${source.type}`);
  }

  const feed = await rssParser.parseURL(source.url);
  const articles: NormalizedArticle[] = [];

  for (const item of feed.items ?? []) {
    if (!item.link || !item.title) continue;

    const publishedAt = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
        ? new Date(item.pubDate)
        : new Date();

    articles.push({
      sourceId: source.id,
      sourceName: source.name,
      title: item.title,
      link: item.link,
      content: item['content:encoded'] ?? item.content,
      contentSnippet: item.contentSnippet,
      publishedAt,
      author: item.creator ?? item.author,
      hash: createHash(`${source.id}:${item.link}`),
    });
  }

  return articles;
}

export async function fetchArticles(sources: SourceDefinition[]) {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const articles = await fetchArticlesFromSource(source);
      return { source, articles };
    }),
  );

  return results
    .filter((entry): entry is PromiseFulfilledResult<{ source: SourceDefinition; articles: NormalizedArticle[] }> => entry.status === "fulfilled")
    .flatMap((entry) => entry.value.articles);
}
