import { NextResponse } from "next/server";

import { SOURCE_DEFINITIONS } from "@/lib/news/sources";
import { createSummary } from "@/lib/news/summarizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hoursParam = searchParams.get("hours");
  const hours = hoursParam ? parseInt(hoursParam, 10) : 24;

  try {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    
    const results = await Promise.allSettled(
      SOURCE_DEFINITIONS.map(async (source) => {
        try {
          const { fetchArticlesFromSource } = await import("@/lib/news/fetchers");
          const articles = await fetchArticlesFromSource(source);
          return { source: source.name, sourceDefinition: source, articles, success: true };
        } catch (error) {
          console.warn(`Failed to fetch ${source.name}:`, error);
          return { source: source.name, sourceDefinition: source, articles: [], success: false, error: String(error) };
        }
      })
    );

    const allArticles = results
      .filter((r): r is PromiseFulfilledResult<{ source: string; sourceDefinition: typeof SOURCE_DEFINITIONS[0]; articles: any[]; success: boolean }> => r.status === "fulfilled")
      .flatMap((r) => r.value.articles.map(article => ({ 
        article, 
        sourceDefinition: r.value.sourceDefinition 
      })));
    
    const recentArticlesWithSource = allArticles
      .filter(({ article }) => article.publishedAt.getTime() >= cutoff)
      .sort((a, b) => b.article.publishedAt.getTime() - a.article.publishedAt.getTime())
      .slice(0, 20);

    console.log(`Starting summarization for ${recentArticlesWithSource.length} articles...`);
    console.log(`OpenAI API key configured: ${!!process.env.OPENAI_API_KEY}`);
    
    const summarizedArticles = await Promise.all(
      recentArticlesWithSource.map(async ({ article, sourceDefinition }, idx) => {
        try {
          console.log(`[${idx + 1}/${recentArticlesWithSource.length}] Summarizing: ${article.title.slice(0, 50)}...`);
          const summary = await createSummary(article, {
            sourceCategory: sourceDefinition.category,
            sourceWeight: sourceDefinition.weight,
          });
          console.log(`[${idx + 1}/${recentArticlesWithSource.length}] ✓ Got ${summary.bullets.length} bullets`);
          return {
            ...article,
            bullets: summary.bullets,
            summary: summary.summary,
            bluf: summary.bluf,
            topic: summary.topic,
            tags: summary.tags,
          };
        } catch (error) {
          console.error(`[${idx + 1}/${recentArticlesWithSource.length}] ✗ Failed to summarize:`, error);
          return {
            ...article,
            bullets: [],
            summary: article.contentSnippet || "",
            bluf: article.contentSnippet || article.title,
            topic: "other",
            tags: [],
          };
        }
      })
    );
    
    console.log(`Summarization complete. Articles with bullets: ${summarizedArticles.filter(a => a.bullets && a.bullets.length > 0).length}`);

    const sourceStatus = results.map((r) => {
      if (r.status === "fulfilled") {
        return {
          source: r.value.source,
          success: r.value.success,
          count: r.value.articles.length,
          error: r.value.success ? undefined : r.value.error,
        };
      }
      return { source: "unknown", success: false, count: 0 };
    });

    return NextResponse.json({
      articles: summarizedArticles,
      count: summarizedArticles.length,
      timeWindow: `${hours}h`,
      sourceStatus,
    });
  } catch (error) {
    console.error("Error fetching morning digest:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
