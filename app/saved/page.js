'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewsGrid } from '@/components/news/NewsGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSavedArticles } from '@/hooks/useSavedArticles';

export default function SavedPage() {
  const { savedIds, hydrated } = useSavedArticles();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!savedIds.length) {
      setArticles([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const fetched = await Promise.all(
        savedIds.map(async (id) => {
          try {
            const res = await fetch(`/api/news/${encodeURIComponent(id)}`);
            const json = await res.json();
            return json.success ? json.data.article : null;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) {
        setArticles(fetched.filter(Boolean));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [savedIds, hydrated]);

  return (
    <PageContainer className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved articles</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Stored locally in your browser for quick access.</p>
      </div>

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
          description="Tap Save on any article card to bookmark it here."
          action={
            <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
              Browse news
            </Link>
          }
        />
      ) : null}

      {hydrated && !loading && articles.length ? <NewsGrid articles={articles} layout="list" /> : null}
    </PageContainer>
  );
}