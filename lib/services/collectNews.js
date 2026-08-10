import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { getEnabledFeeds } from "@/lib/config/rssFeeds.js";
import { fetchAllFeeds } from "@/lib/rss/fetchAllFeeds.js";
import { deduplicateArticles, filterArticlesNotInDatabase } from "@/lib/rss/deduplicateArticles.js";
import { slugify, withSlugSuffix } from "@/lib/utils/slugify.js";
import { parsePublishedDate } from "@/lib/rss/normalizeArticle.js";

export async function collectNews(options = {}) {
  await connectDB();

  const feeds = options.feeds ?? getEnabledFeeds();
  const fetchResult = await fetchAllFeeds(feeds, { timeoutMs: options.timeoutMs ?? 20_000 });

  const { unique, removedCount: inMemoryDuplicates } = deduplicateArticles(fetchResult.articles);
  const { newArticles, existingCount } = await filterArticlesNotInDatabase(Article, unique);

  let inserted = 0;
  const insertErrors = [];

  for (const article of newArticles) {
    try {
      const feed = feeds.find((f) => f.name === article.sourceName);
      const baseSlug = slugify(article.title);
      const slug = withSlugSuffix(baseSlug, article.contentHash?.slice(0, 8) ?? String(Date.now()));

      await Article.create({
        title: article.title,
        slug,
        description: article.description,
        summary: article.description?.slice(0, 500) ?? "",
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl,
        articleUrl: article.articleUrl,
        guid: article.guid,
        contentHash: article.contentHash,
        imageUrl: article.imageUrl,
        publishedAt: parsePublishedDate(article.publishedAt) ?? undefined,
        author: article.author,
        normalizedTitle: article.normalizedTitle,
        category: feed?.category ?? "Other",
        collectedAt: new Date(),
        aiProcessed: false,
      });

      inserted += 1;
    } catch (err) {
      insertErrors.push({
        title: article.title,
        articleUrl: article.articleUrl,
        error: err instanceof Error ? err.message : "Insert failed",
      });
    }
  }

  return {
    feedsProcessed: fetchResult.results.length,
    articlesFetched: fetchResult.articles.length,
    newArticles: inserted,
    duplicates: inMemoryDuplicates + existingCount,
    failedFeeds: fetchResult.errors.length,
    inMemoryDuplicates,
    skippedExisting: existingCount,
    feedResults: fetchResult.results,
    feedErrors: fetchResult.errors,
    insertErrors,
    completedAt: new Date().toISOString(),
  };
}

export default collectNews;