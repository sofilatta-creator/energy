import { NormalizedArticle, Sentiment, Topic } from "./types";

const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  "grid-infrastructure": ["grid", "transmission", "substation", "interconnection", "hvdc"],
  "storage-and-batteries": ["battery", "storage", "lithium", "solid-state", "long-duration"],
  "energy-markets": ["power market", "capacity", "auction", "ppa", "wholesale"],
  "policy-and-regulation": ["regulator", "policy", "federal", "ferc", "eu", "permits"],
  "finance-and-deals": ["investment", "deal", "funding", "ipo", "merger", "purchase"],
  "ai-infrastructure": ["data center", "cooling", "energy demand", "power usage"],
  "ai-hardware": ["gpu", "chip", "semiconductor", "silicon", "accelerator"],
  "ai-policy": ["governance", "compliance", "safety", "regulation", "policy"],
  "emerging-tech": ["fusion", "hydrogen", "new", "pilot", "prototype"],
};

const POSITIVE_TERMS = ["growth", "record", "surge", "expands", "approves", "launches"];
const NEGATIVE_TERMS = ["delay", "decline", "risk", "shortage", "fails", "halt"];

export function detectTopic(article: NormalizedArticle): Topic {
  const haystack = `${article.title} ${article.contentSnippet ?? ""}`.toLowerCase();
  let bestTopic: Topic = "emerging-tech";
  let maxScore = 0;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [Topic, string[]][]) {
    const score = keywords.reduce((acc, keyword) => (haystack.includes(keyword) ? acc + 1 : acc), 0);
    if (score > maxScore) {
      bestTopic = topic;
      maxScore = score;
    }
  }

  // If nothing matched, fall back based on source type heuristics
  if (maxScore === 0) {
    if (haystack.includes("ai") || haystack.includes("gpu")) {
      return "ai-infrastructure";
    }
    if (haystack.includes("grid") || haystack.includes("renewable")) {
      return "grid-infrastructure";
    }
  }

  return bestTopic;
}

export function scoreSentiment(article: NormalizedArticle): Sentiment {
  const haystack = `${article.title} ${article.contentSnippet ?? ""}`.toLowerCase();
  const positiveHits = POSITIVE_TERMS.filter((word) => haystack.includes(word)).length;
  const negativeHits = NEGATIVE_TERMS.filter((word) => haystack.includes(word)).length;

  if (positiveHits > negativeHits) return "positive";
  if (negativeHits > positiveHits) return "negative";
  return "neutral";
}

export function extractKeywords(article: NormalizedArticle): string[] {
  const text = `${article.title} ${article.content ?? article.contentSnippet ?? ""}`;
  const tokens = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 4)
    .map((token) => token.toLowerCase());

  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token]) => token);
}
