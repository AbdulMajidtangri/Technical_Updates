import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { callStructuredAI } from "./callStructuredAI.js";
import { discoverSchema } from "./schemas/intelligenceSchemas.js";
import { DISCOVER_SYSTEM_PROMPT, buildDiscoverUserPrompt } from "./prompts/discoverPrompt.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";

function scoreArticleInterest(article, profile) {
  let score = (article.importanceScore ?? 0) / 100;
  const catWeight = profile.categories?.[article.category] ?? 0;
  score += catWeight * 0.4;

  for (const tag of article.tags ?? []) {
    const tw = profile.topics?.[tag] ?? 0;
    score += tw * 0.15;
  }

  return Math.min(1, score);
}

/**
 * Find missed articles deterministically, optionally enrich with AI reasons.
 * @param {{ readIds?: string[], savedIds?: string[], interestProfile?: object, limit?: number, useAi?: boolean }} options
 */
export async function generateMissedNews(options = {}) {
  await connectDB();

  const readSet = new Set((options.readIds ?? []).map(String));
  const profile = options.interestProfile ?? { categories: {}, topics: {} };
  const limit = Math.min(10, options.limit ?? 5);

  const candidates = await Article.find({
    isDuplicate: { $ne: true },
    importanceScore: { $gte: 55 },
    aiProcessed: true,
  })
    .sort({ importanceScore: -1, publishedAt: -1 })
    .limit(80)
    .lean();

  const missed = candidates
    .filter((a) => !readSet.has(String(a._id)))
    .map((a) => ({ ...a, _interest: scoreArticleInterest(a, profile) }))
    .filter((a) => a._interest >= 0.35)
    .sort((a, b) => b._interest - a._interest)
    .slice(0, limit);

  if (!missed.length) {
    return { success: true, data: { items: [], articles: [] }, cached: false };
  }

  if (!options.useAi || missed.length === 0) {
    const items = missed.map((a) => ({
      articleId: String(a._id),
      reason: buildDeterministicReason(a, profile),
      relevanceScore: a._interest,
      article: toArticleResponse(a),
    }));
    return { success: true, data: { items, articles: items.map((i) => i.article) }, cached: false };
  }

  const missedPayload = missed.map((a) => ({
    articleId: String(a._id),
    title: a.title,
    category: a.category,
    tags: a.tags,
    summary: a.summary,
    importanceScore: a.importanceScore,
  }));

  const result = await callStructuredAI({
    system: DISCOVER_SYSTEM_PROMPT,
    user: buildDiscoverUserPrompt(profile, missedPayload, Object.keys(profile.categories ?? {})),
    schema: discoverSchema,
  });

  if (!result.success) {
    const items = missed.map((a) => ({
      articleId: String(a._id),
      reason: buildDeterministicReason(a, profile),
      relevanceScore: a._interest,
      article: toArticleResponse(a),
    }));
    return { success: true, data: { items, articles: items.map((i) => i.article) }, cached: false };
  }

  const items = result.data.items.map((item) => {
    const doc = missed.find((m) => String(m._id) === item.articleId);
    return {
      ...item,
      article: doc ? toArticleResponse(doc) : null,
    };
  });

  return { success: true, data: { items, articles: items.map((i) => i.article).filter(Boolean) }, cached: false };
}

function buildDeterministicReason(article, profile) {
  const parts = [];
  const catScore = profile.categories?.[article.category];
  if (catScore >= 0.5) {
    parts.push(`You frequently read ${article.category} news`);
  }

  const matchingTags = (article.tags ?? []).filter((t) => (profile.topics?.[t] ?? 0) >= 0.5);
  if (matchingTags.length) {
    parts.push(`this relates to topics you follow (${matchingTags.slice(0, 3).join(", ")})`);
  }

  if (parts.length) {
    return `You may have missed this because ${parts.join(" and ")}, and it scored high importance (${article.importanceScore ?? "—"}).`;
  }

  return `This high-importance story (${article.importanceScore ?? "—"}) in ${article.category} may be relevant to your reading interests.`;
}

export default generateMissedNews;
