"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Clock3, Database, Sparkles } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/Button";

function formatWhen(value) {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Unknown";
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setStats(j.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const healthy = stats && stats.totalArticles > 0;
  const analyzedPct =
    stats && stats.totalArticles
      ? Math.round((stats.articlesAnalyzed / stats.totalArticles) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--accent))]">
          Overview
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white">System at a glance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Everything you need to run TechPulse — health, content volume, and quick paths to sync news
          or inspect intelligence.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Articles in library"
          value={loading ? "…" : stats?.totalArticles ?? 0}
          hint="All non-duplicate stories stored in MongoDB"
          tone={healthy ? "good" : "warn"}
        />
        <AdminStatCard
          label="AI analyzed"
          value={loading ? "…" : `${stats?.articlesAnalyzed ?? 0} (${analyzedPct}%)`}
          hint="Stories with OpenAI summaries and scores"
        />
        <AdminStatCard
          label="Collected today"
          value={loading ? "…" : stats?.articlesToday ?? 0}
          hint="Published or collected since midnight UTC"
        />
        <AdminStatCard
          label="High importance"
          value={loading ? "…" : stats?.importantArticles ?? 0}
          hint="Stories scored 75+ on importance"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-white">Quick actions</h2>
              <p className="mt-1 text-sm text-white/50">Most common tasks, one click away.</p>
            </div>
            <Activity className="h-5 w-5 text-[hsl(var(--accent))]" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/news"
              className="group rounded-xl border border-white/10 bg-[hsl(222_47%_7%)] p-4 transition hover:border-[hsl(var(--accent))]/40"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">Sync news feed</p>
                <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <p className="mt-2 text-sm text-white/50">
                Collect RSS, run AI analysis, and refresh the public homepage.
              </p>
            </Link>

            <Link
              href="/admin/intelligence"
              className="group rounded-xl border border-white/10 bg-[hsl(222_47%_7%)] p-4 transition hover:border-[hsl(var(--accent))]/40"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">Test reading guide</p>
                <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <p className="mt-2 text-sm text-white/50">
                Inspect ActionPlanner and LearnPath results on real articles.
              </p>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/news">
              <Button type="button" variant="accent">
                Open news pipeline
              </Button>
            </Link>
            <Link href="/">
              <Button type="button" variant="secondary" className="border-white/15 bg-transparent text-white hover:bg-white/5">
                Preview public site
              </Button>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-serif text-xl font-semibold text-white">System status</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Database className="mt-0.5 h-4 w-4 text-[hsl(var(--accent))]" />
              <div>
                <p className="font-medium text-white">Database</p>
                <p className="text-white/50">
                  {loading ? "Checking..." : healthy ? "Connected — articles found" : "Empty — run your first sync"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-[hsl(var(--accent))]" />
              <div>
                <p className="font-medium text-white">AI processing</p>
                <p className="text-white/50">{analyzedPct}% of library analyzed</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-[hsl(var(--accent))]" />
              <div>
                <p className="font-medium text-white">Last update</p>
                <p className="text-white/50">{formatWhen(stats?.lastUpdated)}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-medium text-white">Public site</p>
                <p className="text-white/50">Readers only see news — never this panel</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {stats?.categories?.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-serif text-lg font-semibold text-white">Top categories</h2>
            <ul className="mt-4 space-y-2">
              {stats.categories.slice(0, 6).map((row) => (
                <li key={row.category} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{row.category}</span>
                  <span className="tabular-nums text-white/45">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-serif text-lg font-semibold text-white">Top sources</h2>
            <ul className="mt-4 space-y-2">
              {(stats.sources ?? []).slice(0, 6).map((row) => (
                <li key={row.source} className="flex items-center justify-between text-sm">
                  <span className="truncate text-white/80">{row.source}</span>
                  <span className="tabular-nums text-white/45">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      <section className="rounded-2xl border border-[hsl(var(--accent))]/25 bg-[hsl(var(--accent))]/10 p-6">
        <h2 className="font-serif text-lg font-semibold text-white">First-time setup</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/70">
          <li>Ensure MongoDB is running and `.env.local` has `MONGODB_URI`, `OPENAI_API_KEY`, and `CRON_SECRET`.</li>
          <li>Go to <strong className="text-white">News pipeline</strong> and run <strong className="text-white">Full sync</strong>.</li>
          <li>Wait 1–2 minutes, then open the public homepage — stories should appear.</li>
          <li>Open any article to verify the automatic <strong className="text-white">Reading guide</strong>.</li>
        </ol>
      </section>
    </div>
  );
}
