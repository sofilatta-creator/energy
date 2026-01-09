import dedent from "dedent";
import OpenAI from "openai";

import { detectTopic, extractKeywords, scoreSentiment } from "./enrichment";
import { NormalizedArticle, SummaryPayload, Topic } from "./types";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface SummarizeOptions {
  sourceCategory: "energy" | "ai";
  sourceWeight: number;
}

function buildPrompt(article: NormalizedArticle, topic: Topic) {
  return dedent`
    You are a technical analyst covering datacenter infrastructure, power/energy systems, and AI hardware.
    
    Format your response as:
    
    BLUF: [One concise sentence summarizing the key takeaway - what happened and why it matters]
    
    Then provide 2-3 technical bullet points with:
    - Power capacity (MW/GW), energy metrics (GWh, MWh)
    - Datacenter specs: rack density, cooling tech, location/region
    - Grid infrastructure: transmission, interconnection timelines
    - Capital expenditure, deal sizes, financing terms
    - Regulatory approvals, permitting, policy impacts
    - AI compute hardware specs (H100s, B200s, etc.)
    
    Use technical terminology. Be direct and quantitative. Skip marketing fluff.
    
    Title: ${article.title}
    Source: ${article.sourceName}
    Content: ${article.content ?? article.contentSnippet ?? "(no body provided)"}
  `;
}

function fallbackSummary(article: NormalizedArticle) {
  const text = article.contentSnippet ?? article.content ?? article.title;
  const sentences = text.replace(/\n+/g, " ").split(/[.!?]/).map((sentence) => sentence.trim()).filter(Boolean);
  const bullets = sentences.slice(0, 3).map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1));
  const summary = bullets.join(". ");
  const bluf = sentences[0] || article.title;
  return { bullets, summary, bluf };
}

async function llmSummary(article: NormalizedArticle, topic: Topic) {
  if (!openai) {
    return fallbackSummary(article);
  }

  const prompt = buildPrompt(article, topic);
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_SUMMARY_MODEL ?? "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 350,
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content ?? "";
  if (!text) {
    return fallbackSummary(article);
  }

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  let bluf = "";
  const bullets: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith("BLUF:")) {
      bluf = line.replace(/^BLUF:\s*/, "").trim();
    } else if (line.match(/^[-*•]\s*/)) {
      bullets.push(line.replace(/^[-*•]\s*/, "").trim());
    } else if (!bluf && bullets.length === 0) {
      bluf = line;
    } else if (bullets.length < 4) {
      bullets.push(line);
    }
  }
  
  const summary = bluf || bullets.join(". ");
  return { bullets, summary, bluf };
}

function computeImportance(
  article: NormalizedArticle,
  topic: Topic,
  sourceWeight: number,
) {
  const recencyHours = Math.max(
    1,
    (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60),
  );
  const recencyScore = Math.max(0, 24 - recencyHours) / 24;
  const topicBoost = topic.startsWith("ai") ? 1.05 : 1;
  return Number((recencyScore * 0.6 + sourceWeight * 0.3 + topicBoost * 0.1).toFixed(3));
}

export async function createSummary(
  article: NormalizedArticle,
  options: SummarizeOptions,
): Promise<SummaryPayload> {
  const topic = detectTopic(article);
  const sentiment = scoreSentiment(article);
  const keywords = extractKeywords(article);
  const { summary, bullets } = await llmSummary(article, topic);
  const importanceScore = computeImportance(article, topic, options.sourceWeight);

  const base = {
    id: `sum_${article.hash}`,
    articleId: article.hash,
    title: article.title,
    source: article.sourceName,
    link: article.link,
    summary,
    bullets,
    topic,
    tags: keywords.slice(0, 3),
    sentiment,
    keywords,
    importanceScore,
    energyScore: options.sourceCategory === "energy" ? importanceScore : importanceScore * 0.4,
    aiScore: options.sourceCategory === "ai" ? importanceScore : importanceScore * 0.4,
    publishedAt: article.publishedAt,
  } satisfies SummaryPayload;

  return base;
}
