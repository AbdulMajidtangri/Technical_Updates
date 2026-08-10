"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cacheArticleForOffline,
  fetchAndCacheArticle,
  getAllOfflineArticles,
  isArticleCachedOffline,
  removeOfflineArticle,
} from "@/lib/offline/articleCache.js";

export function useOfflineArticles() {
  const [offlineIds, setOfflineIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const articles = await getAllOfflineArticles();
      setOfflineIds(articles.map((a) => a.id));
    } catch {
      setOfflineIds([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveForOffline = useCallback(
    async (articleOrId) => {
      if (!articleOrId) return false;

      if (typeof articleOrId === "object" && articleOrId.id) {
        await cacheArticleForOffline(articleOrId);
        await refresh();
        return true;
      }

      const article = await fetchAndCacheArticle(String(articleOrId));
      await refresh();
      return Boolean(article);
    },
    [refresh],
  );

  const removeFromOffline = useCallback(
    async (id) => {
      await removeOfflineArticle(id);
      await refresh();
    },
    [refresh],
  );

  const isOffline = useCallback(
    (id) => offlineIds.includes(id),
    [offlineIds],
  );

  const checkOffline = useCallback(async (id) => {
    if (offlineIds.includes(id)) return true;
    return isArticleCachedOffline(id);
  }, [offlineIds]);

  return {
    offlineIds,
    hydrated,
    isOffline,
    checkOffline,
    saveForOffline,
    removeFromOffline,
    getAllOfflineArticles,
    refresh,
  };
}

export default useOfflineArticles;
