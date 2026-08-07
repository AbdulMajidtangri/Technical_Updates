"use client";

import { useState } from "react";
import { IntelligenceSection } from "./IntelligenceSection";
import { TrustBadge, TrustNotice } from "./TrustBadge";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

const DEFAULT_QUESTIONS = [
  "What if adoption becomes very high?",
  "What if this faces major regulatory pushback?",
  "What if competitors respond quickly?",
];

export function ScenarioPanel({ articleId, articleTitle }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");

  async function explore(customQuestion) {
    const q = (customQuestion ?? question).trim() || DEFAULT_QUESTIONS[0];
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, question: q }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario exploration failed");
    } finally {
      setLoading(false);
    }
  }

  function EffectList({ title, items, trust = "SCENARIO" }) {
    if (!items?.length) return null;
    return (
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <TrustBadge level={trust} />
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <IntelligenceSection
      id="scenario"
      label="What if"
      title="Scenario explorer"
      summary="Explore possible consequences — not predictions."
    >
      <TrustNotice level="SCENARIO">
        Scenarios are possible outcomes, not facts. Language uses could/may/might — never certainties.
      </TrustNotice>

      <div className="mt-4 space-y-3">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          About: <span className="font-medium text-[hsl(var(--foreground))]">{articleTitle}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => { setQuestion(q); explore(q); }}
              className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs transition hover:bg-[hsl(var(--muted))]"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); explore(); }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What if...?"
            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[hsl(var(--foreground))] px-4 py-2 text-sm font-medium text-[hsl(var(--background))] disabled:opacity-50"
          >
            Explore
          </button>
        </form>
      </div>

      {loading ? <IntelligenceSkeleton message="Exploring scenarios..." /> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {data ? (
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Scenario</p>
            <p className="mt-1 font-serif text-lg font-semibold">{data.scenario}</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Confidence: {data.confidence}</p>
          </div>

          {data.impactChain?.length ? (
            <div className="rounded-md bg-[hsl(var(--surface))] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide">Impact chain</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {data.impactChain.map((node, i) => (
                  <span key={`${node}-${i}`} className="flex items-center gap-2">
                    {i > 0 ? <span>↓</span> : null}
                    <span className="rounded bg-[hsl(var(--card))] px-2 py-1 ring-1 ring-[hsl(var(--border))]">{node}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <EffectList title="Immediate effects" items={data.immediateEffects} />
          <EffectList title="Secondary effects" items={data.secondaryEffects} />
          <EffectList title="Long-term possibilities" items={data.longTermPossibilities} />

          {data.affectedGroups?.length ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Who may be affected</h3>
              <ul className="space-y-2 text-sm">
                {data.affectedGroups.map((g) => (
                  <li key={g.group}><span className="font-medium">{g.group}:</span> {g.explanation}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.uncertainties?.length ? (
            <EffectList title="Uncertainties" items={data.uncertainties} trust="UNKNOWN" />
          ) : null}

          {data.invalidators?.length ? (
            <EffectList title="What could invalidate this scenario" items={data.invalidators} trust="UNKNOWN" />
          ) : null}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default ScenarioPanel;
