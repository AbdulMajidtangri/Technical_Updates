import { createHash } from "crypto";

const HTML_TAG_RE = /<[^>]*>/g;
const WHitespace_RE = /\s+/g;
const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;
const MEDIA_URL_RE = /url=["']?([^"'\s>]+)/i;

/**
 * @param {string | undefined | null} value
 * @returns {string}
 */
export function stripHtml(value) {
  if (!value) return "";
  return value.replace(HTML_TAG_RE, " ").replace(WHitespace_RE, " ").trim();
}

/**
 * @param {string | undefined | null} title
 * @returns {string}
 */
export function normalizeTitle(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(WHitespace_RE, " ")
    .trim();
}

/**
 * @param {string | undefined | null} url
 * @returns {string}
 */
export function normalizeUrl(url) {
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
 * @param {object} item - Raw rss-parser item
 */
function extractImageUrl(item) {
  if (item.enclosure?.url && /^image\//i.test(item.enclosure.type || "")) {
    return item.enclosure.url;
  }

  if (item.image?.url) return item.image.url;

  const mediaContent = item.mediaContent?.[0];
  if (mediaContent?.$?.url) return mediaContent.$.url;
  if (typeof mediaContent?.url === "string") return mediaContent.url;

  const mediaThumbnail = item.mediaThumbnail?.[0];
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  const html = item.contentEncoded || item.content || item.summary || item.description || "";
  const imgMatch = html.match(IMG_SRC_RE);
  if (imgMatch?.[1]) return imgMatch[1];

  const mediaMatch = html.match(MEDIA_URL_RE);
  if (mediaMatch?.[1]) return mediaMatch[1];

  return "";
}

/**
 * Normalize an RSS item into the ingestion article shape.
 * @param {object} item
 * @param {{ id?: string, name?: string, url?: string, sourceUrl?: string }} feedContext
 */
export function normalizeArticle(item, feedContext = {}) {
  const rawTitle = item.title?.trim() || "Untitled";
  const link = item.link || item.guid || "";
  const guid = typeof item.guid === "string" ? item.guid : item.id || link;
  const rawBody =
    item.contentEncoded ||
    item.content ||
    item.contentSnippet ||
    item.summary ||
    item.description ||
    "";

  const descriptionText = stripHtml(item.contentSnippet || item.summary || rawBody).slice(0, 2000);
  const publishedAt = item.isoDate || item.pubDate || null;
  const normalizedTitle = normalizeTitle(rawTitle);
  const articleUrl = normalizeUrl(link);

  const sourceName = feedContext.name ?? feedContext.feedName ?? "";
  const sourceUrl = feedContext.sourceUrl ?? feedContext.url ?? link;

  const hashInput = [normalizedTitle, articleUrl, descriptionText.slice(0, 2000)].join("|");
  const contentHash = createHash("sha256").update(hashInput).digest("hex");

  return {
    title: rawTitle,
    description: descriptionText,
    articleUrl,
    guid: guid?.trim() || articleUrl,
    contentHash,
    imageUrl: extractImageUrl(item),
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    author: item.creator || item.author || "",
    sourceName,
    sourceUrl,
    normalizedTitle,
  };
}

export default normalizeArticle;