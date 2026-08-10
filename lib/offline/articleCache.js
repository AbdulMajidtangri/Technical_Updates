import { deleteRecord, findBySlug, getAllRecords, getRecord, putRecord } from "./db.js";

const MAX_OFFLINE_ARTICLES = 100;

/**
 * Save a full article payload for offline reading.
 * @param {object} article
 */
export async function cacheArticleForOffline(article) {
  if (!article?.id) return { success: false, error: "Missing article id" };

  const existing = await getAllRecords();
  if (existing.length >= MAX_OFFLINE_ARTICLES && !existing.some((a) => a.id === article.id)) {
    const oldest = [...existing].sort((a, b) => (a.savedAt ?? "").localeCompare(b.savedAt ?? ""))[0];
    if (oldest?.id) await deleteRecord(oldest.id);
  }

  await putRecord({
    ...article,
    savedAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function removeOfflineArticle(id) {
  if (!id) return;
  await deleteRecord(id);
}

export async function getOfflineArticle(idOrSlug) {
  if (!idOrSlug) return null;
  const byId = await getRecord(idOrSlug);
  if (byId) return byId;
  return findBySlug(idOrSlug);
}

export async function getAllOfflineArticles() {
  const records = await getAllRecords();
  return records.sort((a, b) => (b.savedAt ?? "").localeCompare(a.savedAt ?? ""));
}

export async function isArticleCachedOffline(id) {
  if (!id) return false;
  const record = await getRecord(id);
  return Boolean(record);
}

/**
 * Fetch article from API and cache it (when online).
 */
export async function fetchAndCacheArticle(id) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return getOfflineArticle(id);
  }

  try {
    const res = await fetch(`/api/news/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) return null;
    const article = json.data?.article ?? json.data;
    if (!article?.id) return null;
    await cacheArticleForOffline(article);
    return article;
  } catch {
    return getOfflineArticle(id);
  }
}

export default cacheArticleForOffline;
