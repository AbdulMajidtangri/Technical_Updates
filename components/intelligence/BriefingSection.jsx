"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { useInterestProfile } from "@/hooks/useInterestProfile";
import { useReadArticles } from "@/hooks/useReadArticles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IntelligenceSkeleton } from "@/components/intelligence/IntelligenceSkeleton";
import { ImportanceIndicator } from "@/components/ui/ImportanceIndicator";

const TIME_OPTIONS = [
  { minutes: 5, label: "5 min", hint: "Quick catch-up" },
  { minutes: 10, label: "10 min", hint: "Balanced" },
  { minutes: 15, label: "15 min", hint: "Full briefing" },
];

export function BriefingSection() {
  const [minutes, setMinutes] = useState(15);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { interestProfile, hydrated: profileReady } = useInterestProfile();
  const { readIds, hydrated: readReady } = useReadArticles();
  const requestIdRef = useRef(0);

  const readIdsKey = useMemo(() => JSON.stringify(readIds), [readIds]);
  const interestKey = useMemo(() => JSON.stringify(interestProfile), [interestProfile]);

  useEffect(() => {
    if (!profileReady || !readReady) return;

    const requestId = ++requestIdRef.current;
    const hasContent = Boolean(briefing?.articles?.length);

    if (hasContent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const res = await fetch("/api/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutes,
            readIds,
            interestProfile,
          }),
        });
        const json = await res.json();
        if (requestId !== requestIdRef.current) return;
        if (json.success) setBriefing(json.data);
      } catch {
        if (requestId !== requestIdRef.current) return;
        if (!hasContent) setBriefing(null);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    })();
  }, [minutes, profileReady, readReady, readIdsKey, interestKey]); // eslint-disable-line react-hooks/exhaustive-deps -- stable serialized deps

  const showInitialSkeleton = loading && !briefing;
  const displayBriefing = briefing;

  return (
    <section id="briefing" className="scroll-mt-24 space-y-6">
      <SectionHeader
        label="Today's intelligence"
        title="Your briefing"
        description="The best stories for your time budget — ranked by importance, recency, and your interests."
      />

      <div className="flex flex-wrap items-center gap-2">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.minutes}
            type="button"
            onClick={() => setMinutes(opt.minutes)}
            disabled={loading && !briefing}
            className={`rounded-lg border px-4 py-2.5 text-left transition disabled:opacity-60 ${
              minutes === opt.minutes
                ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
            }`}
            aria-pressed={minutes === opt.minutes}
          >
            <span className="block text-sm font-semibold">{opt.label}</span>
            <span className={`block text-[11px] ${minutes === opt.minutes ? "opacity-80" : "text-[hsl(var(--muted-foreground))]"}`}>
              {opt.hint}
            </span>
          </button>
        ))}
        {refreshing ? (
          <span className="text-xs text-[hsl(var(--muted-foreground))]" aria-live="polite">
            Updating…
          </span>
        ) : null}
      </div>

      {showInitialSkeleton ? (
        <IntelligenceSkeleton message="Building your personalized briefing..." />
      ) : null}

      {!showInitialSkeleton && displayBriefing?.articles?.length ? (
        <div className={`card-premium overflow-hidden transition-opacity ${refreshing ? "opacity-70" : "opacity-100"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 sm:px-6">
            <p className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>
                <strong className="text-[hsl(var(--foreground))]">{displayBriefing.articleCount} stories</strong>
                {" · ~"}
                {displayBriefing.estimatedMinutes} min read
              </span>
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Skips articles you already read</p>
          </div>

          <ol className="divide-y divide-[hsl(var(--border))]">
            {displayBriefing.articles.map((article) => (
              <li key={article.id} className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface))] font-serif text-sm font-semibold tabular-nums ring-1 ring-[hsl(var(--border))]">
                  {article.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-medium uppercase tracking-wide text-[hsl(var(--accent))]">{article.category}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">·</span>
                    <span className="text-[hsl(var(--muted-foreground))]">~{article.readMinutes} min</span>
                  </div>
                  <h3 className="mt-1 font-serif text-base font-semibold leading-snug sm:text-lg">
                    <Link href={`/news/${article.slug}`} className="hover:text-[hsl(var(--accent))]">
                      {article.title}
                    </Link>
                  </h3>
                  {article.simpleExplanation ? (
                    <div className="mt-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">AI summary</p>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[hsl(var(--foreground))]">
                        {article.simpleExplanation}
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <ImportanceIndicator score={article.importanceScore} />
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--accent))] hover:opacity-80"
                      >
                        Read summary
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{article.sourceName}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {!loading && !refreshing && displayBriefing && !displayBriefing.articles?.length ? (
        <div className="card-premium p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No unread briefing stories right now. You may have read today&apos;s top picks already — check Latest news below.
        </div>
      ) : null}
    </section>
  );
}

export default BriefingSection;
