"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

const SearchDialogContext = createContext(null);

function useDebouncedValue(value, delayMs = 150) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function SearchProvider({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const cacheRef = useRef(new Map());
  const debounced = useDebouncedValue(query.trim(), 150);

  const openSearch = useCallback((initialQuery = "") => {
    setQuery(initialQuery);
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setError("");
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (debounced.length < 2) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const cached = cacheRef.current.get(debounced);
    if (cached) {
      setResults(cached);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/search?q=${encodeURIComponent(debounced)}&limit=8`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setError(json.error?.message ?? "Search failed");
          setResults([]);
          return;
        }
        const items = json.data?.results ?? [];
        cacheRef.current.set(debounced, items);
        setResults(items);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not search right now");
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const goToArticle = useCallback(
    (slug) => {
      closeSearch();
      setQuery("");
      router.push(`/news/${slug}`);
    },
    [closeSearch, router],
  );

  const goToFullSearch = useCallback(() => {
    const q = query.trim();
    closeSearch();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }, [closeSearch, query, router]);

  const value = useMemo(
    () => ({ openSearch, closeSearch, open }),
    [openSearch, closeSearch, open],
  );

  return (
    <SearchDialogContext.Provider value={value}>
      {children}

      {open ? (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] sm:px-6">
          <button
            type="button"
            className="absolute inset-0 bg-[hsl(var(--foreground)/0.35)] backdrop-blur-sm"
            aria-label="Close search"
            onClick={closeSearch}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search articles"
            className="relative z-[201] w-full max-w-2xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-elevated animate-fade-up"
          >
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (results[0]?.slug) goToArticle(results[0].slug);
                    else goToFullSearch();
                  }
                }}
                placeholder="Search titles, tags, sources…"
                className="min-w-0 flex-1 bg-transparent text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[hsl(var(--muted-foreground))]" /> : null}
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[min(420px,50vh)] overflow-y-auto p-2">
              {debounced.length < 2 ? (
                <p className="px-3 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Type at least 2 characters. Shortcut: <kbd className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs">Ctrl K</kbd>
                </p>
              ) : null}

              {error ? <p className="px-3 py-4 text-sm text-red-500">{error}</p> : null}

              {!error && debounced.length >= 2 && !loading && !results.length ? (
                <p className="px-3 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">No results for “{debounced}”</p>
              ) : null}

              <ul className="space-y-1">
                {results.map((article) => (
                  <li key={article.id ?? article.slug}>
                    <button
                      type="button"
                      onClick={() => goToArticle(article.slug)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[hsl(var(--muted)/0.6)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium leading-snug text-[hsl(var(--foreground))]">{article.title}</p>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          {article.category ? `${article.category} · ` : ""}
                          {article.sourceName}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <span>Enter to open top result</span>
              <button type="button" onClick={goToFullSearch} className="link-accent font-semibold">
                Advanced search →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SearchDialogContext.Provider>
  );
}

export function useSearchDialog() {
  const ctx = useContext(SearchDialogContext);
  if (!ctx) {
    return {
      open: false,
      openSearch: () => {},
      closeSearch: () => {},
    };
  }
  return ctx;
}

export default SearchProvider;
