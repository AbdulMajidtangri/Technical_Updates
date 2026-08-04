'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'techpulse-saved';

export function useSavedArticles() {
  const [savedIds, setSavedIds, hydrated] = useLocalStorage(STORAGE_KEY, []);

  const savedSet = useMemo(() => new Set(Array.isArray(savedIds) ? savedIds : []), [savedIds]);

  const isSaved = useCallback((id) => savedSet.has(id), [savedSet]);

  const toggleSaved = useCallback(
    (id) => {
      if (!id) return;
      setSavedIds((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.includes(id)) return list.filter((x) => x !== id);
        return [id, ...list];
      });
    },
    [setSavedIds],
  );

  const removeSaved = useCallback(
    (id) => {
      setSavedIds((prev) => (Array.isArray(prev) ? prev.filter((x) => x !== id) : []));
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