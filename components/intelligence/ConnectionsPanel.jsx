"use client";

import { useState } from "react";
import Link from "next/link";
import { IntelligenceSection } from "./IntelligenceSection";
import { TrustNotice } from "./TrustBadge";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

export function ConnectionsPanel({ articleId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (data || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find connections");
    } finally {
      setLoading(false);
    }
  }

  const count = data?.connections?.length ?? 0;

  return (
    <IntelligenceSection
      id="connections"
      label="Connect the story"
      title="Related developments"
      summary={count ? `${count} related connection(s) found.` : "See how this story connects to others."}
    >
      {!data && !loading ? (
        <button type="button" onClick={load} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]">
          View connections
        </button>
      ) : null}
      {loading ? <IntelligenceSkeleton message="Finding related developments..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="space-y-4">
          <TrustNotice level="AI_ANALYSIS">Connections are AI-analyzed with confidence levels. Only meaningful relationships are shown.</TrustNotice>
          {data.connectionChain?.length ? (
            <div className="rounded-md bg-[hsl(var(--surface))] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">How this story connects</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {data.connectionChain.map((node, i) => (
                  <span key={`${node}-${i}`} className="flex items-center gap-2">
                    {i > 0 ? <span className="text-[hsl(var(--muted-foreground))]">→</span> : null}
                    <span className="rounded bg-[hsl(var(--card))] px-2 py-1 ring-1 ring-[hsl(var(--border))]">{node}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {data.connections?.length ? (
            <ul className="divide-y divide-[hsl(var(--border))] rounded-md border border-[hsl(var(--border))]">
              {data.connections.map((conn) => (
                <li key={conn.articleId ?? conn.title} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold uppercase text-[hsl(var(--accent))]">{conn.relationshipType}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">·</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{conn.confidence} confidence</span>
                  </div>
                  {conn.article?.slug ? (
                    <Link href={`/news/${conn.article.slug}`} className="mt-1 block font-serif font-semibold hover:text-[hsl(var(--accent))]">
                      {conn.title || conn.article.title}
                    </Link>
                  ) : (
                    <p className="mt-1 font-serif font-semibold">{conn.title}</p>
                  )}
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{conn.explanation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No related stories found yet.</p>
          )}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default ConnectionsPanel;
