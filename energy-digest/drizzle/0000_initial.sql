CREATE TABLE IF NOT EXISTS `sources` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `url` text NOT NULL,
  `type` text NOT NULL,
  `category` text NOT NULL,
  `region` text NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `weight` real DEFAULT 1 NOT NULL,
  `topics` text DEFAULT '[]',
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `articles` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL,
  `source_name` text NOT NULL,
  `title` text NOT NULL,
  `url` text NOT NULL,
  `author` text,
  `published_at` integer NOT NULL,
  `content` text,
  `excerpt` text,
  `hash` text NOT NULL,
  `created_at` integer NOT NULL,
  CONSTRAINT `articles_source_id_sources_id_fk` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `articles_url_unique` UNIQUE (`url`),
  CONSTRAINT `articles_hash_unique` UNIQUE (`hash`)
);

CREATE TABLE IF NOT EXISTS `summaries` (
  `id` text PRIMARY KEY NOT NULL,
  `article_id` text NOT NULL,
  `summary` text NOT NULL,
  `bullets` text NOT NULL,
  `sentiment` text NOT NULL,
  `topic` text NOT NULL,
  `tags` text NOT NULL,
  `keywords` text NOT NULL,
  `importance_score` real DEFAULT 0 NOT NULL,
  `energy_score` real DEFAULT 0 NOT NULL,
  `ai_score` real DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  CONSTRAINT `summaries_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `summaries_article_id_unique` UNIQUE (`article_id`)
);

CREATE TABLE IF NOT EXISTS `digests` (
  `id` text PRIMARY KEY NOT NULL,
  `digest_date` integer NOT NULL,
  `headline` text NOT NULL,
  `summary` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `digest_items` (
  `id` text PRIMARY KEY NOT NULL,
  `digest_id` text NOT NULL,
  `summary_id` text NOT NULL,
  `topic` text NOT NULL,
  `category` text NOT NULL,
  `rank` integer DEFAULT 0 NOT NULL,
  CONSTRAINT `digest_items_digest_id_digests_id_fk` FOREIGN KEY (`digest_id`) REFERENCES `digests`(`id`) ON UPDATE no action ON DELETE no action,
  CONSTRAINT `digest_items_summary_id_summaries_id_fk` FOREIGN KEY (`summary_id`) REFERENCES `summaries`(`id`) ON UPDATE no action ON DELETE no action
);
