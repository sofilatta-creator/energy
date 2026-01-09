import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

import { DigestItem } from "@/lib/news/types";
import { TOPIC_LABELS } from "@/lib/news/topics";

interface DigestCardProps {
  item: DigestItem;
}

const sentimentColors = {
  positive: "text-emerald-500",
  neutral: "text-zinc-500",
  negative: "text-rose-500",
} as const;

export function DigestCard({ item }: DigestCardProps) {
  return (
    <article className="rounded-3xl border border-zinc-100 bg-white/70 p-6 shadow-[0_10px_50px_rgba(15,23,42,0.06)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {TOPIC_LABELS[item.topic]}
        </span>
        <span className={sentimentColors[item.sentiment]}>{item.sentiment}</span>
        <span className="text-zinc-400">{format(item.publishedAt, "MMM d, HH:mm")}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
        <span className="font-semibold text-zinc-900 dark:text-white">{item.source}</span>
        <span aria-hidden>•</span>
        <span className="capitalize">{item.category}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{item.summary}</p>
      <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
        {item.bullets.slice(0, 3).map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
      >
        Open source
        <ExternalLink size={16} />
      </a>
    </article>
  );
}
