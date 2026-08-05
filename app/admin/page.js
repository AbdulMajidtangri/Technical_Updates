'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeTime } from '@/lib/utils/formatDate';

const SECRET_KEY = 'techpulse-cron-secret';

async function postAction(path, secret) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  return { ok: res.ok, json };
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [stats, setStats] = useState(null);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_KEY);
    if (stored) setSecret(stored);
  }, []);

  const persistSecret = (value) => {
    setSecret(value);
    if (value) sessionStorage.setItem(SECRET_KEY, value);
    else sessionStorage.removeItem(SECRET_KEY);
  };

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const run = async (label, path) => {
    if (!secret.trim()) {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] Missing CRON_SECRET`, ...prev].slice(0, 20));
      return;
    }
    setBusy(label);
    const { ok, json } = await postAction(path, secret.trim());
    const message = ok
      ? `[${new Date().toLocaleTimeString()}] ${label} OK — ${JSON.stringify(json.data ?? {})}`
      : `[${new Date().toLocaleTimeString()}] ${label} failed — ${json.error?.message ?? 'Error'}`;
    setLog((prev) => [message, ...prev].slice(0, 20));
    setBusy('');
    if (ok) loadStats();
  };

  return (
    <PageContainer className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer controls</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Trigger collection, AI processing, and sync jobs. Secret is kept in session storage only.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">CRON_SECRET</span>
        <input
          type="password"
          value={secret}
          onChange={(e) => persistSecret(e.target.value)}
          placeholder="Bearer token for protected routes"
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
          autoComplete="off"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={!!busy} onClick={() => run('Collect', '/api/news/collect')}>
          {busy === 'Collect' ? 'Collecting…' : 'Collect news'}
        </Button>
        <Button type="button" variant="secondary" disabled={!!busy} onClick={() => run('Process', '/api/news/process')}>
          {busy === 'Process' ? 'Processing…' : 'Process with AI'}
        </Button>
        <Button type="button" variant="secondary" disabled={!!busy} onClick={() => run('Sync', '/api/news/sync')}>
          {busy === 'Sync' ? 'Syncing…' : 'Sync pipeline'}
        </Button>
        <Button type="button" variant="ghost" onClick={loadStats}>
          Refresh stats
        </Button>
      </div>

      <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="font-semibold">Pipeline stats</h2>
        {statsLoading ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : stats ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-[hsl(var(--muted-foreground))]">Total articles</dt>
              <dd className="text-lg font-semibold tabular-nums">{stats.totalArticles}</dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--muted-foreground))]">AI analyzed</dt>
              <dd className="text-lg font-semibold tabular-nums">{stats.articlesAnalyzed}</dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--muted-foreground))]">Today</dt>
              <dd className="text-lg font-semibold tabular-nums">{stats.articlesToday}</dd>
            </div>
            <div>
              <dt className="text-[hsl(var(--muted-foreground))]">High importance</dt>
              <dd className="text-lg font-semibold tabular-nums">{stats.importantArticles}</dd>
            </div>
            {stats.lastUpdated ? (
              <div className="sm:col-span-2 text-[hsl(var(--muted-foreground))]">
                Last updated {formatRelativeTime(stats.lastUpdated)}
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Unable to load stats.</p>
        )}
      </section>

      {log.length ? (
        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5">
          <h2 className="font-semibold">Activity log</h2>
          <ul className="mt-3 space-y-2 font-mono text-xs text-[hsl(var(--muted-foreground))]">
            {log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageContainer>
  );
}