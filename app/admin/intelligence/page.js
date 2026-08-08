"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

function StatusPill({ value }) {
  const colors = {
    ACTION_REQUIRED: "bg-amber-500/20 text-amber-100",
    ACTION_RECOMMENDED: "bg-orange-500/20 text-orange-100",
    MONITOR: "bg-blue-500/20 text-blue-100",
    NO_ACTION_REQUIRED: "bg-emerald-500/20 text-emerald-100",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${colors[value] ?? "bg-white/10 text-white/70"}`}>
      {value?.replaceAll("_", " ") ?? "Unknown"}
    </span>
  );
}

export default function AdminIntelligencePage() {
  const [articles, setArticles] = useState([]);
  const [articleId, setArticleId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/news?limit=8&page=1")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setArticles(j.data?.articles ?? []);
      })
      .catch(() => {});
  }, []);

  async function inspect(id, runFresh = false) {
    const targetId = (id ?? articleId).trim();
    if (!targetId) return;
    setArticleId(targetId);
    setLoading(true);
    setError("");
    setData(null);
    try {
      if (runFresh) {
        const [apRes, lpRes] = await Promise.all([
          fetch("/api/intelligence/action-planner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId: targetId, force: true }),
          }).then((r) => r.json()),
          fetch("/api/intelligence/learn-path", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId: targetId, force: true, knowledgeProfile: { concepts: {} } }),
          }).then((r) => r.json()),
        ]);
        if (!apRes.success && !lpRes.success) throw new Error("Both analyses failed");
        setData({
          articleId: targetId,
          actionPlanner: apRes.success ? apRes.data : null,
          learnPath: lpRes.success ? lpRes.data : null,
        });
      } else {
        const res = await fetch(`/api/intelligence/article/${targetId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Load failed");
        setData({ ...json.data, articleId: targetId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  }

  const ap = data?.actionPlanner;
  const lp = data?.learnPath;
  const selectedArticle = articles.find((a) => a.id === articleId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--accent))]">
          Intelligence
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white">Reading guide inspector</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          See exactly what readers get from Step 1 (key terms) and Step 2 (action check) on any article.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label className="block text-sm font-medium text-white">
          Article ID
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              placeholder="Paste MongoDB article ID"
              className="w-full rounded-lg border border-white/10 bg-[hsl(222_47%_6%)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--accent))] focus:outline-none"
            />
          </div>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="border-white/15 bg-transparent text-white hover:bg-white/5" disabled={loading} onClick={() => inspect(null, false)}>
            Load cached
          </Button>
          <Button type="button" variant="accent" disabled={loading} onClick={() => inspect(null, true)}>
            {loading ? "Running..." : "Run fresh analysis"}
          </Button>
        </div>

        {articles.length ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Recent articles</p>
            <ul className="mt-3 space-y-2">
              {articles.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => inspect(article.id, false)}
                    className="w-full rounded-lg border border-white/10 bg-[hsl(222_47%_7%)] px-3 py-2 text-left text-sm transition hover:border-[hsl(var(--accent))]/40"
                  >
                    <p className="line-clamp-1 font-medium text-white">{article.title}</p>
                    <p className="mt-0.5 text-xs text-white/45">{article.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </section>

      {selectedArticle ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
          Inspecting: <span className="text-white">{selectedArticle.title}</span>
          {selectedArticle.slug ? (
            <Link href={`/news/${selectedArticle.slug}`} className="ml-3 inline-flex items-center gap-1 text-[hsl(var(--accent))]">
              View public page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {ap ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-white">Step 2 — Action check</h2>
            <StatusPill value={ap.status} />
          </div>
          <p className="text-sm text-white/60">{ap.reason || ap.headline}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Relevance", ap.relevanceScore],
              ["Urgency", ap.urgencyScore],
              ["Confidence", ap.confidenceScore],
            ].map(([label, score]) => (
              <div key={label} className="rounded-lg border border-white/10 p-3">
                <p className="text-[11px] uppercase text-white/40">{label}</p>
                <p className="mt-1 font-serif text-2xl tabular-nums text-white">{score ?? "—"}</p>
              </div>
            ))}
          </div>
          {ap.actions?.length ? (
            <ol className="space-y-3">
              {ap.actions.map((action, i) => (
                <li key={action.title} className="rounded-lg border border-white/10 p-4 text-sm">
                  <p className="font-medium text-white">
                    {i + 1}. {action.title}
                  </p>
                  <p className="mt-1 text-white/60">{action.description}</p>
                  {action.evidence ? <p className="mt-2 text-xs text-white/45">Evidence: {action.evidence}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-100">No actions returned — readers see “nothing to do”.</p>
          )}
        </section>
      ) : null}

      {data && !ap && !lp && !loading ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
          No cached intelligence for this article yet. Click <strong className="text-white">Run fresh analysis</strong> to generate it.
        </section>
      ) : null}

      {lp ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-serif text-xl font-semibold text-white">Step 1 — Key terms</h2>
          <p className="text-sm text-white/60">{lp.learningSummary}</p>
          {lp.knowledgeGaps?.length ? (
            <div className="space-y-3">
              {lp.knowledgeGaps.map((gap) => (
                <article key={gap.conceptId} className="rounded-lg border border-white/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">{gap.concept}</p>
                    <span className="text-xs text-white/45">Gap {gap.gapScore} · Priority {gap.learningPriority}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/65">{gap.explanation}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-100">No term cards — readers can read straight through.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
