"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { NewsGrid } from "@/components/news/NewsGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const inputRef = useRef(null);
  const cacheRef = useRef(new Map());
  const [query, setQuery] = useState(initial);
  const [debounced, setDebounced] = useState(initial.trim());
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setQuery(initial);
    setDebounced(initial.trim());
  }, [initial]);

  const runSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      setError("");
      return;
    }

    const cached = cacheRef.current.get(q);
    if (cached) {
      setResults(cached);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Search failed");
        setResults([]);
      } else {
        const items = json.data?.results ?? [];
        cacheRef.current.set(q, items);
        setResults(items);
      }
    } catch {
      setError("Network error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debounced);
  }, [debounced, runSearch]);

  useEffect(() => {
    const q = debounced.trim();
    const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
    router.replace(url, { scroll: false });
  }, [debounced, router]);

  return (
    <PageContainer className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold tracking-editorial">Search</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Find articles by title, summary, tags, or source.</p>
        <label className="relative mt-6 block">
          <span className="sr-only">Search query</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--accent))]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tech news..."
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-3 pl-11 pr-4 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            autoComplete="off"
            autoFocus
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
