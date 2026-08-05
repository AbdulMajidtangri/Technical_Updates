import { fetchFeed } from "./fetchFeed.js";
import { normalizeArticle } from "./normalizeArticle.js";

/**
 * Fetch all enabled feeds and normalize items. Continues when individual feeds fail.
 * @param {Array<{ id?: string, name?: string, url: string, enabled?: boolean, sourceUrl?: string }>} feeds
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ articles: object[], results: object[], errors: object[] }>}
 */
export async function fetchAllFeeds(feeds, options = {}) {
  const enabledFeeds = (feeds ?? []).filter((feed) => feed && feed.url && feed.enabled !== false);

  const articles = [];
  const results = [];
  const errors = [];

  for (const feed of enabledFeeds) {
    const feedMeta = {
      feedId: feed.id ?? feed._id?.toString?.() ?? feed.url,
      feedName: feed.name ?? "",
      feedUrl: feed.url,
      sourceUrl: feed.sourceUrl ?? feed.url,
      name: feed.name,
      url: feed.url,
    };

    const outcome = await fetchFeed(feed.url, { timeoutMs: options.timeoutMs, feedMeta });

    if (!outcome.ok) {
      errors.push({
        feedId: feedMeta.feedId,
        feedName: feedMeta.feedName,
        url: feed.url,
        error: outcome.error,
        statusCode: outcome.statusCode,
      });
      results.push({
        feedId: feedMeta.feedId,
        feedName: feedMeta.feedName,
        url: feed.url,
        ok: false,
        itemCount: 0,
        error: outcome.error,
      });
      continue;
    }

    const normalized = outcome.items.map((item) => normalizeArticle(item, feedMeta));
    articles.push(...normalized);

    results.push({
      feedId: feedMeta.feedId,
      feedName: feedMeta.feedName,
      url: feed.url,
      ok: true,
      itemCount: normalized.length,
      feedTitle: outcome.feed.title,
    });
  }

  return { articles, results, errors };
}

export default fetchAllFeeds;