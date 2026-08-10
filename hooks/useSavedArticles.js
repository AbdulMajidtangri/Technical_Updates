'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { cacheArticleForOffline, fetchAndCacheArticle, removeOfflineArticle } from '@/lib/offline/articleCache.js';

const STORAGE_KEY = 'techpulse-saved';

async function syncOfflineCache(id, article, adding) {
  try {
    if (adding) {
      if (article?.id) {
        await cacheArticleForOffline(article);
      } else {
        await fetchAndCacheArticle(id);
      }
    } else {
      await removeOfflineArticle(id);
    }
  } catch {
    // Offline cache is best-effort; saved IDs still work online.
  }
}

export function useSavedArticles() {
  const [savedIds, setSavedIds, hydrated] = useLocalStorage(STORAGE_KEY, []);

  const savedSet = useMemo(() => new Set(Array.isArray(savedIds) ? savedIds : []), [savedIds]);

  const isSaved = useCallback((id) => savedSet.has(id), [savedSet]);

  const toggleSaved = useCallback(
    (id, article) => {
      if (!id) return;
      setSavedIds((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const adding = !list.includes(id);
        syncOfflineCache(id, article, adding);
        if (adding) return [id, ...list];
        return list.filter((x) => x !== id);
      });
    },
    [setSavedIds],
  );

  const removeSaved = useCallback(
    (id) => {
      setSavedIds((prev) => (Array.isArray(prev) ? prev.filter((x) => x !== id) : []));
      syncOfflineCache(id, null, false);
    },
    [setSavedIds],
  );

  return {
    savedIds: Array.isArray(savedIds) ? savedIds : [],
    isSaved,
    toggleSaved,
    removeSaved,
    hydrated,
  };
}

export default useSavedArticles;
