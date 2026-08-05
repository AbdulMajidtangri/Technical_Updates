import { createHash } from "crypto";

/**
 * Normalize title for hashing (matches RSS normalization semantics).
 * @param {string | null | undefined} title
 * @returns {string}
 */
export function normalizeTitleForHash(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize URL for hashing and deduplication.
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function normalizeUrlForHash(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    let pathname = parsed.pathname.replace(/\/+$/, "") || "";
    if (pathname && !pathname.startsWith("/")) pathname = `/${pathname}`;
    parsed.pathname = pathname || "/";
    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Deterministic SHA-256 content hash for duplicate detection.
 * @param {{ title?: string, url?: string, content?: string, normalizedTitle?: string }} article
 * @param {{ contentSliceLength?: number }} [options]
 * @returns {string}
 */
export function generateContentHash(article, options = {}) {
  const contentSliceLength = options.contentSliceLength ?? 2000;
  const normalizedTitle = article.normalizedTitle ?? normalizeTitleForHash(article.title);
  const url = normalizeUrlForHash(article.url);
  const content = (article.content ?? "").slice(0, contentSliceLength);
  const hashInput = [normalizedTitle, url, content].join("|");
  return createHash("sha256").update(hashInput).digest("hex");
}

export default generateContentHash;