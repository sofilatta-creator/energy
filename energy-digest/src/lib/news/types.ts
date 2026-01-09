export type Topic =
  | "grid-infrastructure"
  | "storage-and-batteries"
  | "energy-markets"
  | "policy-and-regulation"
  | "finance-and-deals"
  | "ai-infrastructure"
  | "ai-hardware"
  | "ai-policy"
  | "emerging-tech";

export type Sentiment = "positive" | "neutral" | "negative";

export interface SourceDefinition {
  id: string;
  name: string;
  url: string;
  type: "rss" | "json";
  category: "energy" | "ai";
  region: string;
  weight: number;
  topics: Topic[];
  keywords?: string[];
}

export interface RawArticle {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  publishedAt: Date;
  contentSnippet?: string;
  content?: string;
  author?: string;
}

export interface NormalizedArticle extends RawArticle {
  hash: string;
}

export interface SummaryPayload {
  id: string;
  articleId: string;
  title: string;
  source: string;
  link: string;
  summary: string;
  bullets: string[];
  topic: Topic;
  tags: string[];
  sentiment: Sentiment;
  keywords: string[];
  importanceScore: number;
  energyScore: number;
  aiScore: number;
  publishedAt: Date;
}

export interface DigestItem {
  id: string;
  topic: Topic;
  sentiment: Sentiment;
  tags: string[];
  bullets: string[];
  title: string;
  source: string;
  link: string;
  summary: string;
  publishedAt: Date;
  importanceScore: number;
  category: "energy" | "ai";
}

export interface DigestRecord {
  id: string;
  digestDate: Date;
  headline: string;
  summary: string;
  items: DigestItem[];
}

export interface DigestHistoryEntry {
  digestDate: Date;
  headline: string;
  itemCount: number;
}

export interface PipelineResult {
  sourcesProcessed: number;
  articlesFetched: number;
  articlesStored: number;
  summariesCreated: number;
  digestId?: string;
}

export interface DigestResponse {
  digest: DigestRecord;
  stats: {
    energyItems: number;
    aiItems: number;
    latestPublishedAt?: Date;
  };
}

export type SummaryFilter = {
  topic?: Topic;
  sentiment?: Sentiment;
  query?: string;
};

export type TopicBucket = {
  topic: Topic;
  label: string;
};
