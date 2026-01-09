import { DigestGrid } from "@/components/digest/digest-grid";
import { DigestHero } from "@/components/hero/digest-hero";
import { HistoryTimeline } from "@/components/history/history-timeline";
import { getDigestHistory, getLatestDigest } from "@/lib/server/digest-service";

export default async function Home() {
  const [digest, history] = await Promise.all([
    getLatestDigest(),
    getDigestHistory(8),
  ]);

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 sm:py-16">
        <DigestHero digest={digest} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DigestGrid items={digest.items} />
          <HistoryTimeline history={history} />
        </div>
      </main>
    </div>
  );
}
