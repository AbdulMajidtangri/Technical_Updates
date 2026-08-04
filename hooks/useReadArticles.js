'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'techpulse-read';

export function useReadArticles() {
  const [readIds, setReadIds, hydrated] = useLocalStorage(STORAGE_KEY, []);

  const readSet = useMemo(() => new Set(Array.isArray(readIds) ? readIds : []), [readIds]);

  const isRead = useCallback((id) => readSet.has(id), [readSet]);

  const markRead = useCallback(
    (id) => {
      if (!id) return;
      setReadIds((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.includes(id)) return list;
        return [id, ...list].slice(0, 500);
      });
    },
    [setReadIds],
  );

  const markUnread = useCallback(
    (id) => {
      setReadIds((prev) => (Array.isArray(prev) ? prev.filter((x) => x !== id) : []));
    },
    [setReadIds],
  );

  const toggleRead = useCallback(
    (id) => {
      if (isRead(id)) markUnread(id);
      else markRead(id);
    },
    [isRead, markRead, markUnread],
  );

  return {
    readIds: Array.isArray(readIds) ? readIds : [],
    isRead,
    markRead,
    markUnread,
    toggleRead,
    hydrated,
  };
}

export default useReadArticles;