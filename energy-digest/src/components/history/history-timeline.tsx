import { format } from "date-fns";

import { DigestHistoryEntry } from "@/lib/news/types";

interface HistoryTimelineProps {
  history: DigestHistoryEntry[];
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white/70 p-6 shadow-[0_10px_50px_rgba(15,23,42,0.04)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Digest history</p>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Last {history.length} releases</h2>
        </div>
      </div>
      <ol className="space-y-5">
        {history.map((entry) => (
          <li key={entry.digestDate.toISOString()} className="flex gap-4">
            <div className="relative mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
              <span className="text-xs font-semibold">{entry.itemCount}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {format(entry.digestDate, "MMM d")}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{entry.headline}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
