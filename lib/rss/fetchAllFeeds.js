import { fetchFeed } from "./fetchFeed.js";
import { normalizeArticle } from "./normalizeArticle.js";

const DEFAULT_CONCURRENCY = 8;

function normalizeFeedItems(items, feedMeta) {
  const normalized = [];
  for (const item of items) {
    try {
      normalized.push(normalizeArticle(item, feedMeta));
    } catch {
      // Skip malformed RSS items so one bad entry does not fail the whole feed.
    }
  }
  return normalized;
}

async function fetchOneFeed(feed, options) {
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
    return {
      type: "error",
      error: {
        feedId: feedMeta.feedId,
        feedName: feedMeta.feedName,
        url: feed.url,
        error: outcome.error,
        statusCode: outcome.statusCode,
      },
      result: {
        feedId: feedMeta.feedId,
        feedName: feedMeta.feedName,
        url: feed.url,
        ok: false,
        itemCount: 0,
        error: outcome.error,
      },
    };
  }

  const normalized = normalizeFeedItems(outcome.items, feedMeta);

  return {
    type: "success",
    articles: normalized,
    result: {
      feedId: feedMeta.feedId,
      feedName: feedMeta.feedName,
      url: feed.url,
      ok: true,
      itemCount: normalized.length,
      feedTitle: outcome.feed.title,
    },
  };
}

/**
 * Fetch feeds in parallel batches for faster collection.
 */
export async function fetchAllFeeds(feeds, options = {}) {
  const enabledFeeds = (feeds ?? []).filter((feed) => feed && feed.url && feed.enabled !== false);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const articles = [];
  const results = [];
  const errors = [];

  for (let i = 0; i < enabledFeeds.length; i += concurrency) {
    const batch = enabledFeeds.slice(i, i + concurrency);
    const outcomes = await Promise.all(batch.map((feed) => fetchOneFeed(feed, options)));

    for (const outcome of outcomes) {
      results.push(outcome.result);
      if (outcome.type === "error") {
        errors.push(outcome.error);
      } else {
        articles.push(...outcome.articles);
      }
    }
  }

  return { articles, results, errors };
}

export default fetchAllFeeds;
