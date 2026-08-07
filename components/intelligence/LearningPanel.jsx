"use client";

import { useState } from "react";
import { IntelligenceSection } from "./IntelligenceSection";
import { TrustNotice } from "./TrustBadge";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

const DIFFICULTY_COLORS = {
  BEGINNER: "text-emerald-700",
  INTERMEDIATE: "text-amber-700",
  ADVANCED: "text-rose-700",
};

export function LearningPanel({ articleId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (data || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Learning suggestions unavailable");
    } finally {
      setLoading(false);
    }
  }

  const conceptCount = data?.concepts?.length ?? 0;

  return (
    <IntelligenceSection
      id="learn"
      label="Learn from this"
      title="Turn this into learning"
      summary={conceptCount ? `${conceptCount} concepts to explore.` : "Concepts and a practical task from this story."}
    >
      {!data && !loading ? (
        <button type="button" onClick={load} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]">
          Start learning
        </button>
      ) : null}
      {loading ? <IntelligenceSkeleton message="Preparing learning suggestions..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="space-y-5">
          <TrustNotice level="AI_ANALYSIS">Learning paths are AI-suggested based on the article. Tasks are designed to be realistic.</TrustNotice>
          <p className="text-sm leading-relaxed">{data.whyLearn}</p>
          {data.learningOrder?.length ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Suggested order</h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {data.learningOrder.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ol>
            </div>
          ) : null}
          <ul className="space-y-4">
            {data.concepts?.map((c) => (
              <li key={c.name} className="rounded-md border border-[hsl(var(--border))] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium">{c.name}</h4>
                  <span className={`text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[c.difficulty] ?? ""}`}>{c.difficulty}</span>
                </div>
                <p className="mt-2 text-sm">{c.explanation}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{c.relevance}</p>
                {c.exercise ? <p className="mt-2 text-xs font-medium">Exercise: {c.exercise}</p> : null}
              </li>
            ))}
          </ul>
          {data.practicalTask ? (
            <div className="rounded-md bg-[hsl(var(--surface))] p-4">
              <h3 className="text-sm font-medium">
                {data.estimatedMinutes ? `${data.estimatedMinutes}-minute task` : "Practical task"}
              </h3>
              <p className="mt-2 text-sm">{data.practicalTask}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default LearningPanel;
