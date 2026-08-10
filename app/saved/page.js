'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewsGrid } from '@/components/news/NewsGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useOfflineArticles } from '@/hooks/useOfflineArticles';
import { fetchAndCacheArticle, getAllOfflineArticles } from '@/lib/offline/articleCache.js';

export default function SavedPage() {
  const { savedIds, hydrated: savedReady } = useSavedArticles();
  const { offlineIds, hydrated: offlineReady, refresh: refreshOffline } = useOfflineArticles();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (!savedReady || !offlineReady) return;

    if (!savedIds.length) {
      setArticles([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const cached = await getAllOfflineArticles();
      const byId = new Map(cached.map((a) => [a.id, a]));
      const initial = savedIds.map((id) => byId.get(id)).filter(Boolean);

      if (!cancelled) {
        setArticles(initial);
        setLoading(false);
      }

      if (!online) return;

      const refreshed = await Promise.all(
        savedIds.map(async (id) => {
          if (byId.has(id)) return byId.get(id);
          return fetchAndCacheArticle(id);
        }),
      );

      if (!cancelled) {
        setArticles(refreshed.filter(Boolean));
        refreshOffline();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [savedIds, savedReady, offlineReady, online, refreshOffline]);

  async function syncAllOffline() {
    if (!savedIds.length || !online) return;
    setSyncing(true);
    try {
      const refreshed = await Promise.all(savedIds.map((id) => fetchAndCacheArticle(id)));
      setArticles(refreshed.filter(Boolean));
      await refreshOffline();
    } finally {
      setSyncing(false);
    }
  }

  const offlineCount = savedIds.filter((id) => offlineIds.includes(id)).length;
  const hydrated = savedReady && offlineReady;

  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Saved & offline</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Saved articles are stored on this device. When you save while online, a full offline copy is kept so you
            can read without internet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
              online
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200'
                : 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100'
            }`}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? 'Online' : 'Offline mode'}
          </span>
          {online && savedIds.length ? (
            <button
              type="button"
              onClick={syncAllOffline}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--muted))]"
            >
              <Download className="h-3.5 w-3.5" />
              {syncing ? 'Updating...' : 'Update offline copies'}
            </button>
          ) : null}
        </div>
      </div>

      {hydrated && savedIds.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Saved</p>
            <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{savedIds.length}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Available offline
            </p>
            <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{offlineCount}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Open any saved story below. Offline copies use the <strong className="text-[hsl(var(--foreground))]">Read offline</strong> link — works without Wi‑Fi.
          </div>
        </div>
      ) : null}

      {!hydrated || loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {hydrated && !loading && !savedIds.length ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap Save on any article to bookmark it and download an offline copy automatically."
          action={
            <Link href="/" className="text-sm font-medium text-[hsl(var(--accent))] hover:opacity-80">
              Browse news
            </Link>
          }
        />
      ) : null}

      {hydrated && !loading && articles.length ? (
        <div className="space-y-6">
          <NewsGrid articles={articles} layout="list" offlineLinks />
        </div>
      ) : null}

      {hydrated && !loading && savedIds.length && !articles.length && !online ? (
        <EmptyState
          title="No offline copies yet"
          description="These articles were saved but not downloaded. Connect to the internet once, then tap Update offline copies."
        />
      ) : null}
    </PageContainer>
  );
}
