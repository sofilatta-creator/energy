"use client";

import { useMemo, useState } from "react";

import { DigestItem, Topic } from "@/lib/news/types";
import { ALL_TOPICS } from "@/lib/news/topics";

import { DigestCard } from "./digest-card";

interface DigestGridProps {
  items: DigestItem[];
}

const SENTIMENTS = [
  { value: "all", label: "All sentiments" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

export function DigestGrid({ items }: DigestGridProps) {
  const [topicFilter, setTopicFilter] = useState<"all" | Topic>("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTopic = topicFilter === "all" || item.topic === topicFilter;
      const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
      const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      return matchesTopic && matchesSentiment && matchesQuery;
    });
  }, [items, topicFilter, sentimentFilter, query]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-zinc-100 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Topic focus
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value as Topic | "all")}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All topics</option>
              {ALL_TOPICS.map(({ topic, label }) => (
                <option key={topic} value={topic}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Sentiment
            <select
              value={sentimentFilter}
              onChange={(event) => setSentimentFilter(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {SENTIMENTS.map((sentiment) => (
                <option key={sentiment.value} value={sentiment.value}>
                  {sentiment.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="grid congestion, GPUs, PPAs..."
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </label>
        </div>
        <div className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {filteredItems.length} insights
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredItems.map((item) => (
          <DigestCard key={`${item.id}-${item.topic}`} item={item} />
        ))}
        {!filteredItems.length && (
          <div className="col-span-full rounded-3xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No articles match that filter right now. Try another topic.
          </div>
        )}
      </div>
    </section>
  );
}
