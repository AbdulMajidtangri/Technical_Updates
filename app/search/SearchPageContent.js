'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewsGrid } from '@/components/news/NewsGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setQuery(initial);
    setDebounced(initial.trim());
  }, [initial]);

  const runSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? 'Search failed');
        setResults([]);
      } else {
        setResults(json.data?.results ?? []);
      }
    } catch {
      setError('Network error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debounced);
  }, [debounced, runSearch]);

  return (
    <PageContainer className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Find articles by title, summary, tags, or source.</p>
        <label className="relative mt-6 block">
          <span className="sr-only">Search query</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tech news..."
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-3 pl-11 pr-4 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            autoComplete="off"
          />
        </label>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {!loading && error ? <EmptyState title="Search error" description={error} /> : null}

      {!loading && !error && debounced.length >= 2 && !results.length ? (
        <EmptyState title="No results" description={`Nothing matched "${debounced}".`} />
      ) : null}

      {!loading && results.length ? (
        <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{results.length} result(s)</p>
          <NewsGrid articles={results} layout="list" />
        </div>
      ) : null}
    </PageContainer>
  );
}