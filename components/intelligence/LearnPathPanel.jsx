"use client";

import { useState } from "react";
import { IntelligenceSection } from "./IntelligenceSection";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";
import { useKnowledgeProfile } from "@/hooks/useKnowledgeProfile";

export function LearnPathPanel({ articleId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const { knowledgeProfile, markAlreadyKnow, markUnderstood, recordQuizResult, hydrated } = useKnowledgeProfile();

  async function load() {
    if (data || loading || !hydrated) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intelligence/learn-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, knowledgeProfile }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "LearnPath failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Learning guidance temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }

  function handleQuiz(concept, selectedIndex) {
    setQuizAnswers((prev) => ({ ...prev, [concept.conceptId]: selectedIndex }));
    const correct = concept.quiz?.correctIndex === selectedIndex;
    recordQuizResult(concept.concept, concept.category, correct);
  }

  const gaps = data?.knowledgeGaps ?? [];
  const summary = data?.learningSummary ?? "Identify knowledge gaps before reading this story.";

  return (
    <IntelligenceSection
      id="learn-path"
      label="LearnPath"
      title="Understand this story"
      summary={summary}
    >
      {!data && !loading ? (
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]"
        >
          Check knowledge gaps
        </button>
      ) : null}

      {loading ? <IntelligenceSkeleton message="Analyzing concepts and knowledge gaps..." /> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      {data && !gaps.length ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{data.learningSummary}</p>
      ) : null}

      {gaps.length ? (
        <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{data.learningSummary}</p>
          {gaps.map((gap) => (
            <article key={gap.conceptId} className="rounded-md border border-[hsl(var(--border))] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold">{gap.concept}</h3>
                <span className="rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-[11px] font-medium uppercase">
                  Gap: {gap.gapScore}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">What is it?</p>
                  <p className="mt-1 leading-relaxed">{gap.explanation}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Why it matters here</p>
                  <p className="mt-1 leading-relaxed">{gap.whyItMatters}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Example</p>
                  <p className="mt-1 leading-relaxed">{gap.example}</p>
                </div>
                {gap.connection ? (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Connection: {gap.connection}</p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markUnderstood(gap.concept, gap.category)}
                  className="rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--muted))]"
                >
                  I understand this
                </button>
                <button
                  type="button"
                  onClick={() => markAlreadyKnow(gap.concept, gap.category)}
                  className="rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--muted))]"
                >
                  Already knew this
                </button>
              </div>

              {gap.quiz ? (
                <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
                  <p className="text-xs font-medium">Check your understanding</p>
                  <p className="mt-1 text-sm">{gap.quiz.question}</p>
                  <ul className="mt-2 space-y-1">
                    {gap.quiz.options.map((opt, idx) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onClick={() => handleQuiz(gap, idx)}
                          className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                            quizAnswers[gap.conceptId] === idx
                              ? idx === gap.quiz.correctIndex
                                ? "bg-emerald-100 dark:bg-emerald-950/40"
                                : "bg-red-100 dark:bg-red-950/40"
                              : "hover:bg-[hsl(var(--muted))]"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default LearnPathPanel;
