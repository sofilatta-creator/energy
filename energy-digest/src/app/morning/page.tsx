"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Article = {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  contentSnippet?: string;
  publishedAt: string;
  author?: string;
  bullets?: string[];
  summary?: string;
  bluf?: string;
  topic?: string;
  tags?: string[];
};

type SourceStatus = {
  source: string;
  success: boolean;
  count: number;
  error?: string;
};

type DigestResponse = {
  articles: Article[];
  count: number;
  timeWindow: string;
  sourceStatus?: SourceStatus[];
};

export default function MorningDigestPage() {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(168);

  const fetchDigest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/morning-digest?hours=${hours}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setDigest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load digest");
    } finally {
      setLoading(false);
    }
  };

  const groupedBySource = digest?.articles.reduce((acc, article) => {
    if (!acc[article.sourceName]) {
      acc[article.sourceName] = [];
    }
    acc[article.sourceName].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Morning Digest
            </h1>
            <p className="mt-1 text-slate-600">
              Your datacenter & AI news in one place
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={24}>Last 24h</option>
              <option value={72}>Last 3 days</option>
              <option value={168}>Last week</option>
              <option value={336}>Last 2 weeks</option>
            </select>
            <button
              onClick={fetchDigest}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!digest && !loading && (
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-600">
              Click refresh to load your morning digest
            </p>
          </div>
        )}

        {digest && (
          <div className="space-y-6">
            <div className="rounded-lg bg-indigo-50 p-4">
              <p className="text-sm text-indigo-900">
                Found <strong>{digest.count}</strong> articles from the{" "}
                {digest.timeWindow}
              </p>
              {digest.sourceStatus && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-indigo-700">
                    Source status
                  </summary>
                  <div className="mt-2 space-y-1 text-xs">
                    {digest.sourceStatus.map((status) => (
                      <div key={status.source} className="flex items-center justify-between">
                        <span>{status.source}</span>
                        <span className={status.success ? "text-green-700" : "text-red-700"}>
                          {status.success ? `✓ ${status.count} articles` : `✗ Failed`}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {groupedBySource &&
              Object.entries(groupedBySource).map(([source, articles]) => (
                <div
                  key={source}
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-indigo-500"></div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {source}
                    </h2>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {articles.length} {articles.length === 1 ? "article" : "articles"}
                    </span>
                  </div>
                  <div className="space-y-5">
                    {articles.map((article, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-indigo-400 bg-white rounded-lg pl-6 py-4 pr-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-slate-900 hover:text-indigo-600 leading-tight block"
                        >
                          {article.title}
                        </a>
                        
                        {article.bluf && (
                          <div className="mt-3 bg-indigo-50 border-l-2 border-indigo-400 pl-3 py-2 rounded">
                            <p className="text-xs uppercase tracking-wide font-semibold text-indigo-700 mb-1">
                              Bottom Line Up Front
                            </p>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed">
                              {article.bluf}
                            </p>
                          </div>
                        )}
                        
                        {article.bullets && article.bullets.length > 0 ? (
                          <ul className="mt-4 space-y-2.5">
                            {article.bullets.map((bullet, bulletIdx) => (
                              <li key={bulletIdx} className="flex gap-3 text-sm leading-relaxed">
                                <span className="mt-0.5 text-indigo-500 font-bold text-base">•</span>
                                <span className="text-slate-700">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        ) : article.contentSnippet ? (
                          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            {article.contentSnippet}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            {formatDistanceToNow(new Date(article.publishedAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {article.author && <span>by {article.author}</span>}
                          {article.topic && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5">
                              {article.topic}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
