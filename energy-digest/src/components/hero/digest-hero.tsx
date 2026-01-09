import { format } from "date-fns";

import { DigestRecord } from "@/lib/news/types";

interface DigestHeroProps {
  digest: DigestRecord;
}

export function DigestHero({ digest }: DigestHeroProps) {
  const energyItems = digest.items.filter((item) => item.category === "energy").length;
  const aiItems = digest.items.length - energyItems;

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-zinc-100 bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 p-1 shadow-[0_40px_90px_rgba(15,23,42,0.35)] dark:border-zinc-800">
      <div className="rounded-[38px] bg-white/90 p-8 dark:bg-zinc-950/90">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500">Daily Infrastructure Brief</p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-950 dark:text-white">
          {digest.headline}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">{digest.summary}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-4 py-2 font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {format(digest.digestDate, "EEEE, MMM d")}
          </span>
          <span className="rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
            {energyItems} energy insights
          </span>
          <span className="rounded-full bg-violet-50 px-4 py-2 font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-200">
            {aiItems} AI infrastructure insights
          </span>
        </div>
      </div>
    </div>
  );
}
