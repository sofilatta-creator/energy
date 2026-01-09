import { describe, expect, it } from "vitest";

import { DigestItem } from "@/lib/news/types";

import { buildDigestSummary, buildHeadline, selectDigestItems } from "../pipeline";

const sampleItems: DigestItem[] = Array.from({ length: 6 }).map((_, index) => ({
  id: `item-${index}`,
  topic: index % 2 === 0 ? "grid-infrastructure" : "ai-infrastructure",
  category: index % 2 === 0 ? "energy" : "ai",
  sentiment: "neutral",
  tags: ["tag"],
  bullets: ["point"],
  title: `Headline ${index}`,
  source: "Test",
  link: "https://example.com",
  summary: "Summary",
  publishedAt: new Date(),
  importanceScore: 1 - index * 0.1,
}));

describe("pipeline helpers", () => {
  it("limits items per topic", () => {
    const selected = selectDigestItems(sampleItems, 1, 10);
    const topicCounts = selected.reduce<Record<string, number>>((acc, item) => {
      acc[item.topic] = (acc[item.topic] ?? 0) + 1;
      return acc;
    }, {});
    expect(topicCounts["grid-infrastructure"]).toBeLessThanOrEqual(1);
    expect(topicCounts["ai-infrastructure"]).toBeLessThanOrEqual(1);
  });

  it("builds headline snippets", () => {
    const headline = buildHeadline(sampleItems.slice(0, 2));
    expect(headline).toContain("Headline");
  });

  it("summarizes digest metadata", () => {
    const summary = buildDigestSummary(sampleItems.slice(0, 3), new Date("2024-01-01"));
    expect(summary).toContain("energy grid");
  });
});
