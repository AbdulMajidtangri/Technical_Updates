"use client";

import Link from "next/link";
import { useKnowledgeProfile } from "@/hooks/useKnowledgeProfile";
import { PageContainer } from "@/components/layout/PageContainer";
import { DEFAULT_RELATIONSHIPS } from "@/lib/intelligence/learnPath/knowledgeGap.js";

function ScoreBar({ label, score }) {
  const value = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[hsl(var(--muted-foreground))]">{value}% familiar</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { hydrated, concepts } = useKnowledgeProfile();

  const conceptList = Object.values(concepts ?? {}).sort(
    (a, b) => (b.familiarityScore ?? 0) - (a.familiarityScore ?? 0),
  );

  const categoryMap = {};
  for (const c of conceptList) {
    const cat = c.category ?? "General";
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
    categoryMap[cat].total += c.familiarityScore ?? 0;
    categoryMap[cat].count += 1;
  }

  const categories = Object.entries(categoryMap)
    .map(([name, { total, count }]) => ({ name, score: Math.round(total / count) }))
    .sort((a, b) => b.score - a.score);

  return (
    <PageContainer className="space-y-10 pb-16 pt-8">
      <header className="max-w-2xl border-b border-[hsl(var(--border))] pb-6">
        <p className="section-label">Your learning</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          What you know so far
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          This profile grows slowly as you read stories and tap &ldquo;Got it&rdquo; or &ldquo;I already knew this&rdquo;
          on term cards. It helps future stories skip things you already understand.
        </p>
      </header>

      {!hydrated ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading your profile...</p>
      ) : null}

      {hydrated && !conceptList.length ? (
        <div className="card-premium space-y-3 p-8 text-center">
          <p className="font-medium">Nothing tracked yet</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Open any article — the reading guide at the top will suggest terms when needed.
          </p>
          <Link href="/" className="inline-block text-sm font-medium text-[hsl(var(--accent))]">
            Browse latest news
          </Link>
        </div>
      ) : null}

      {categories.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-xl font-semibold">Topics</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Average familiarity by subject area.
            </p>
          </div>
          <div className="card-premium space-y-4 p-6">
            {categories.map((cat) => (
              <ScoreBar key={cat.name} label={cat.name} score={cat.score} />
            ))}
          </div>
        </section>
      ) : null}

      {conceptList.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-xl font-semibold">Terms you have seen</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Most recent and strongest familiarity first.
            </p>
          </div>
          <ul className="card-premium divide-y divide-[hsl(var(--border))]">
            {conceptList.slice(0, 30).map((c) => (
              <li key={c.conceptId} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{c.category}</p>
                </div>
                <div className="text-right text-xs tabular-nums">
                  <p>{c.familiarityScore ?? 0}% familiar</p>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {c.confidenceScore ?? 0}% confidence
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">How topics connect</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            A simple map of related ideas — useful when a story references something new.
          </p>
        </div>
        <div className="card-premium p-6">
          <div className="space-y-3">
            {DEFAULT_RELATIONSHIPS.map(([parent, child, rel]) => (
              <div key={`${parent}-${child}`} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded bg-[hsl(var(--surface))] px-2 py-1 ring-1 ring-[hsl(var(--border))]">
                  {parent}
                </span>
                <span className="text-[hsl(var(--muted-foreground))">→</span>
                <span className="rounded bg-[hsl(var(--surface))] px-2 py-1 ring-1 ring-[hsl(var(--border))]">
                  {child}
                </span>
                <span className="text-[10px] uppercase text-[hsl(var(--muted-foreground))]">{rel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
