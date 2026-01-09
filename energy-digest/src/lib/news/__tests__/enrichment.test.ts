import { describe, expect, it } from "vitest";

import { detectTopic, extractKeywords, scoreSentiment } from "../enrichment";

const baseArticle = {
  sourceId: "test",
  sourceName: "Test",
  title: "",
  link: "https://example.com",
  publishedAt: new Date(),
  hash: "hash",
};

describe("enrichment helpers", () => {
  it("deterministically classifies grid content", () => {
    const topic = detectTopic({
      ...baseArticle,
      title: "FERC approves new grid interconnection rules",
      contentSnippet: "Transmission operators must publish new queue metrics",
    });
    expect(topic).toBe("grid-infrastructure");
  });

  it("extracts high-signal keywords", () => {
    const keywords = extractKeywords({
      ...baseArticle,
      title: "Battery storage deployment hits record in CAISO",
      content: "Battery developers added 4.6GW of capacity while lithium costs declined",
    });
    expect(keywords[0]).toContain("battery");
  });

  it("scores sentiment using word lists", () => {
    const sentiment = scoreSentiment({
      ...baseArticle,
      title: "Record investment surges into AI data centers",
      contentSnippet: "Rapid growth offsets earlier decline",
    });
    expect(sentiment).toBe("positive");
  });
});
