"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { IntelligenceSection } from "./IntelligenceSection";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";
import { TrustBadge } from "./TrustBadge";

export function ActionPlannerPanel({ articleId, sourceUrl, sourceName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (data || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intelligence/action-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Analysis failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action analysis unavailable");
    } finally {
      setLoading(false);
    }
  }

  const showPanel = data && data.status !== "NO_ACTION_REQUIRED" && data.actions?.length > 0;
  const summary = data
    ? data.headline
    : "Check whether this story requires any action on your part.";

  return (
    <IntelligenceSection
      id="action-planner"
      label="ActionPlanner"
      title="Do you need to act?"
      summary={summary}
    >
      {!data && !loading ? (
        <button
          type="button"
          onClick={analyze}
          className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]"
        >
          Analyze for actions
        </button>
      ) : null}

      {loading ? <IntelligenceSkeleton message="Analyzing actionable signals..." /> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      {data && !showPanel ? (
        <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="font-medium">No action required</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {data.reason || "This article does not identify a specific action that readers need to take."}
            </p>
          </div>
        </div>
      ) : null}

      {showPanel ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-md border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="font-semibold">{data.headline}</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{data.reason}</p>
            </div>
          </div>

          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-md border border-[hsl(var(--border))] p-3">
              <p className="uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Relevance</p>
              <p className="mt-1 font-serif text-lg font-semibold tabular-nums">{data.relevanceScore}</p>
            </div>
            <div className="rounded-md border border-[hsl(var(--border))] p-3">
              <p className="uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Urgency</p>
              <p className="mt-1 font-serif text-lg font-semibold tabular-nums">{data.urgencyScore}</p>
            </div>
            <div className="rounded-md border border-[hsl(var(--border))] p-3">
              <p className="uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Confidence</p>
              <p className="mt-1 font-serif text-lg font-semibold tabular-nums">{data.confidenceScore}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium">What you may need to do</h3>
            <ol className="space-y-4">
              {data.actions.map((action, i) => (
                <li key={action.title} className="rounded-md border border-[hsl(var(--border))] p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold uppercase text-[hsl(var(--accent))]">{action.urgency} urgency</span>
                    <span className="text-[hsl(var(--muted-foreground))">·</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{action.confidence} confidence</span>
                    <TrustBadge level="AI_ANALYSIS" />
                  </div>
                  <p className="mt-2 font-medium">{i + 1}. {action.title}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{action.description}</p>
                  {action.targetAudience ? (
                    <p className="mt-2 text-xs"><span className="font-medium">Who:</span> {action.targetAudience}</p>
                  ) : null}
                  {action.deadline ? (
                    <p className="mt-1 text-xs"><span className="font-medium">Deadline:</span> {action.deadline}</p>
                  ) : null}
                  {action.evidence ? (
                    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]"><span className="font-medium">Evidence:</span> {action.evidence}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {sourceUrl ? (
            <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--accent))]">
              Read original source
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default ActionPlannerPanel;
