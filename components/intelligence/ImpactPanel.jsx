"use client";

import { useState } from "react";
import Link from "next/link";
import { IntelligenceSection } from "./IntelligenceSection";
import { TrustNotice } from "./TrustBadge";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

const LEVEL_WIDTH = { LOW: 4, MEDIUM: 6, HIGH: 8, "VERY HIGH": 10 };

export function ImpactPanel({ articleId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (data || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impact analysis unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IntelligenceSection
      id="impact"
      label="Impact"
      title="Who may be affected?"
      summary="AI-estimated impact across relevant groups."
    >
      {!data && !loading ? (
        <button type="button" onClick={load} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]">
          Explore impact
        </button>
      ) : null}
      {loading ? <IntelligenceSkeleton message="Building impact analysis..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="space-y-4">
          <TrustNotice level="AI_ANALYSIS">
            AI-estimated relevance — not factual measurement. Impact bars reflect estimated significance only.
          </TrustNotice>
          {data.summary ? <p className="text-sm leading-relaxed">{data.summary}</p> : null}
          <ul className="space-y-4">
            {data.impacts?.map((item) => {
              const fill = item.score ?? LEVEL_WIDTH[item.level] ?? 5;
              return (
                <li key={item.group}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{item.group}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--accent))]">{item.level}</span>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]" aria-hidden="true">
                    <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${Math.min(100, fill * 10)}%` }} />
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground))]">{item.explanation}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.reason}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default ImpactPanel;
