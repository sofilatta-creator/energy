import { relations } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  region: text("region").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  weight: real("weight").notNull().default(1),
  topics: text("topics", { mode: "json" }).$type<string[]>().default([]),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id),
  sourceName: text("source_name").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  author: text("author"),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }).notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  hash: text("hash").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const summaries = sqliteTable("summaries", {
  id: text("id").primaryKey(),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id),
  summary: text("summary").notNull(),
  bullets: text("bullets", { mode: "json" }).$type<string[]>().notNull(),
  sentiment: text("sentiment").notNull(),
  topic: text("topic").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  keywords: text("keywords", { mode: "json" }).$type<string[]>().notNull(),
  importanceScore: real("importance_score").notNull().default(0),
  energyScore: real("energy_score").notNull().default(0),
  aiScore: real("ai_score").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const digests = sqliteTable("digests", {
  id: text("id").primaryKey(),
  digestDate: integer("digest_date", { mode: "timestamp_ms" }).notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const digestItems = sqliteTable("digest_items", {
  id: text("id").primaryKey(),
  digestId: text("digest_id")
    .notNull()
    .references(() => digests.id),
  summaryId: text("summary_id")
    .notNull()
    .references(() => summaries.id),
  topic: text("topic").notNull(),
  category: text("category").notNull(),
  rank: integer("rank").notNull().default(0),
});

export const sourceRelations = relations(sources, ({ many }) => ({
  articles: many(articles),
}));

export const articleRelations = relations(articles, ({ one }) => ({
  source: one(sources, {
    fields: [articles.sourceId],
    references: [sources.id],
  }),
  summary: one(summaries, {
    fields: [articles.id],
    references: [summaries.articleId],
  }),
}));

export const summaryRelations = relations(summaries, ({ one, many }) => ({
  article: one(articles, {
    fields: [summaries.articleId],
    references: [articles.id],
  }),
  digestItems: many(digestItems),
}));

export const digestRelations = relations(digests, ({ many }) => ({
  items: many(digestItems),
}));

export const digestItemRelations = relations(digestItems, ({ one }) => ({
  digest: one(digests, {
    fields: [digestItems.digestId],
    references: [digests.id],
  }),
  summary: one(summaries, {
    fields: [digestItems.summaryId],
    references: [summaries.id],
  }),
}));
