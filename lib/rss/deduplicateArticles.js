import { normalizeTitle, normalizeUrl } from "./normalizeArticle.js";

/**
 * @param {object} article
 * @returns {string}
 */
function articleKey(article) {
  const url = article.url ?? article.articleUrl;
  if (url) return `url:${normalizeUrl(url)}`;
  if (article.guid) return `guid:${String(article.guid).trim().toLowerCase()}`;
  if (article.contentHash) return `hash:${article.contentHash}`;
  if (article.normalizedTitle) return `title:${article.normalizedTitle}`;
  return `fallback:${article.title ?? ""}`;
}

/**
 * Remove duplicate articles using URL, GUID, content hash, and normalized title.
 * Keeps the first occurrence in input order.
 * @param {object[]} articles
 * @returns {{ unique: object[], duplicates: object[], removedCount: number }}
 */
export function deduplicateArticles(articles) {
  if (!Array.isArray(articles)) {
    return { unique: [], duplicates: [], removedCount: 0 };
  }

  const seenUrl = new Set();
  const seenGuid = new Set();
  const seenHash = new Set();
  const seenTitle = new Set();
  const unique = [];
  const duplicates = [];

  for (const article of articles) {
    const urlRaw = article.url ?? article.articleUrl;
    const urlKey = urlRaw ? normalizeUrl(urlRaw) : "";
    const guidKey = article.guid ? String(article.guid).trim().toLowerCase() : "";
    const hashKey = article.contentHash ?? "";
    const titleKey = article.normalizedTitle ?? normalizeTitle(article.title);

    const isDuplicate =
      (urlKey && seenUrl.has(urlKey)) ||
      (guidKey && seenGuid.has(guidKey)) ||
      (hashKey && seenHash.has(hashKey)) ||
      (titleKey && seenTitle.has(titleKey));

    if (isDuplicate) {
      duplicates.push({ ...article, isDuplicate: true });
      continue;
    }

    if (urlKey) seenUrl.add(urlKey);
    if (guidKey) seenGuid.add(guidKey);
    if (hashKey) seenHash.add(hashKey);
    if (titleKey) seenTitle.add(titleKey);

    unique.push(article);
  }

  return {
    unique,
    duplicates,
    removedCount: duplicates.length,
  };
}

/**
 * Collect dedupe keys from normalized articles for DB lookups.
 * @param {object[]} articles
 */
export function collectDedupeKeys(articles) {
  const urls = new Set();
  const guids = new Set();
  const hashes = new Set();
  const titles = new Set();

  for (const article of articles ?? []) {
    const urlRaw = article.url ?? article.articleUrl;
    if (urlRaw) urls.add(normalizeUrl(urlRaw));
    if (article.guid) guids.add(String(article.guid).trim().toLowerCase());
    if (article.contentHash) hashes.add(article.contentHash);
    const titleKey = article.normalizedTitle ?? normalizeTitle(article.title);
    if (titleKey) titles.add(titleKey);
  }

  return {
    urls: [...urls],
    guids: [...guids],
    hashes: [...hashes],
    titles: [...titles],
  };
}

/**
 * Return articles that are not already stored (by url, guid, contentHash, normalizedTitle).
 * @param {import("mongoose").Model} ArticleModel
 * @param {object[]} articles
 * @returns {Promise<{ newArticles: object[], existingCount: number, existingKeys: Set<string> }>}
 */
export async function filterArticlesNotInDatabase(ArticleModel, articles) {
  if (!articles?.length) {
    return { newArticles: [], existingCount: 0, existingKeys: new Set() };
  }

  const keys = collectDedupeKeys(articles);
  const orClauses = [];

  if (keys.urls.length) orClauses.push({ articleUrl: { $in: keys.urls } });
  if (keys.guids.length) orClauses.push({ guid: { $in: keys.guids } });
  if (keys.hashes.length) orClauses.push({ contentHash: { $in: keys.hashes } });
  if (keys.titles.length) orClauses.push({ normalizedTitle: { $in: keys.titles } });

  if (!orClauses.length) {
    return { newArticles: articles, existingCount: 0, existingKeys: new Set() };
  }

  const existing = await ArticleModel.find({ $or: orClauses })
    .select("articleUrl guid contentHash normalizedTitle")
    .lean();

  const existingKeys = new Set();
  for (const row of existing) {
    if (row.articleUrl) existingKeys.add(`url:${normalizeUrl(row.articleUrl)}`);
    if (row.guid) existingKeys.add(`guid:${String(row.guid).trim().toLowerCase()}`);
    if (row.contentHash) existingKeys.add(`hash:${row.contentHash}`);
    if (row.normalizedTitle) existingKeys.add(`title:${row.normalizedTitle}`);
  }

  const newArticles = [];
  let existingCount = 0;

  for (const article of articles) {
    const urlRaw = article.url ?? article.articleUrl;
    const urlKey = urlRaw ? normalizeUrl(urlRaw) : "";
    const guidKey = article.guid ? String(article.guid).trim().toLowerCase() : "";
    const hashKey = article.contentHash ?? "";
    const titleKey = article.normalizedTitle ?? normalizeTitle(article.title);

    const exists =
      (urlKey && existingKeys.has(`url:${urlKey}`)) ||
      (guidKey && existingKeys.has(`guid:${guidKey}`)) ||
      (hashKey && existingKeys.has(`hash:${hashKey}`)) ||
      (titleKey && existingKeys.has(`title:${titleKey}`));

    if (exists) {
      existingCount += 1;
      continue;
    }

    newArticles.push(article);
  }

  return { newArticles, existingCount, existingKeys };
}

export { articleKey };
export default deduplicateArticles;