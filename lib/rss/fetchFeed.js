import Parser from "rss-parser";

const DEFAULT_TIMEOUT_MS = 15_000;
const USER_AGENT = "TechPulseAI/1.0 (+https://github.com/techpulse-ai)";

const parser = new Parser({
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

/**
 * Fetch and parse a single RSS/Atom feed with timeout and structured errors.
 * @param {string} url
 * @param {{ timeoutMs?: number, feedMeta?: object }} [options]
 * @returns {Promise<{ ok: true, feed: object, items: object[] } | { ok: false, error: string, statusCode?: number }>}
 */
export async function fetchFeed(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!url || typeof url !== "string") {
    return { ok: false, error: "Feed URL is required" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status} fetching feed`,
        statusCode: response.status,
      };
    }

    const xml = await response.text();
    const parsed = await parser.parseString(xml);

    return {
      ok: true,
      feed: {
        title: parsed.title ?? options.feedMeta?.name ?? "",
        link: parsed.link ?? "",
        description: parsed.description ?? "",
        ...options.feedMeta,
      },
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, error: `Feed request timed out after ${timeoutMs}ms` };
    }

    const message = err instanceof Error ? err.message : "Unknown feed fetch error";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default fetchFeed;