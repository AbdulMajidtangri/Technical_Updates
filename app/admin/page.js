'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

const SECRET_KEY = 'techpulse-cron-secret';

async function callApi(path, secret) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': secret,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? json.error ?? 'Request failed');
  return json.data;
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem(SECRET_KEY);
    if (saved) setSecret(saved);
    fetch('/api/stats')
      .then((r) => r.json())
      .then((j) => j.success && setStats(j.data))
      .catch(() => {});
  }, []);

  function saveSecret() {
    sessionStorage.setItem(SECRET_KEY, secret);
    setError('');
  }

  async function run(action, path) {
    if (!secret.trim()) {
      setError('Enter your CRON_SECRET first (same value as in .env.local)');
      return;
    }
    sessionStorage.setItem(SECRET_KEY, secret);
    setLoading(action);
    setError('');
    setResult(null);
    try {
      const data = await callApi(path, secret.trim());
      setResult(data);
      const s = await fetch('/api/stats').then((r) => r.json());
      if (s.success) setStats(s.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading('');
    }
  }

  return (
    <PageContainer className="py-10">
      <h1 className="text-3xl font-bold">Developer Controls</h1>
      <p className="mt-2 text-[hsl(var(--muted-foreground))]">
        Fetch RSS news, run AI analysis, and populate your dashboard.
      </p>

      {stats ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Total articles', stats.totalArticles],
            ['AI analyzed', stats.articlesAnalyzed],
            ['Today', stats.articlesToday],
            ['Important', stats.importantArticles],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[hsl(var(--border))] p-4">
              <p className="text-2xl font-bold">{value ?? 0}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 max-w-lg space-y-4 rounded-xl border border-[hsl(var(--border))] p-6">
        <label className="block text-sm font-medium">
          CRON Secret
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Same as CRON_SECRET in .env.local"
            className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
          />
        </label>
        <Button type="button" variant="outline" onClick={saveSecret}>
          Save secret
        </Button>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" disabled={!!loading} onClick={() => run('collect', '/api/news/collect')}>
            {loading === 'collect' ? 'Collecting...' : '1. Collect RSS'}
          </Button>
          <Button type="button" disabled={!!loading} onClick={() => run('process', '/api/news/process')}>
            {loading === 'process' ? 'Processing...' : '2. Process AI'}
          </Button>
          <Button type="button" disabled={!!loading} onClick={() => run('sync', '/api/news/sync')}>
            {loading === 'sync' ? 'Syncing...' : 'Sync (both)'}
          </Button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {result ? (
          <pre className="max-h-64 overflow-auto rounded-lg bg-[hsl(var(--muted))] p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-800 dark:bg-brand-950">
        <p className="font-medium">First-time setup</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[hsl(var(--muted-foreground))]">
          <li>Make sure MongoDB is running and .env.local is configured</li>
          <li>Enter CRON_SECRET (yours is set in .env.local)</li>
          <li>Click <strong>Sync (both)</strong> — wait 1–2 minutes</li>
          <li>Go back to Home — news should appear</li>
        </ol>
      </div>
    </PageContainer>
  );
}