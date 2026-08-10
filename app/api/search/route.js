import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";
import { rankArticles } from "@/lib/ranking/rankArticles.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { clampNumber, sanitizeString } from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

export async function GET(request) {
  try {
    const rate = checkApiRateLimit(getApiClientKey(request, "search"));
    if (!rate.allowed) {
      return jsonError("Too many search requests. Please wait.", { status: 429, code: "RATE_LIMITED" });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") ?? "", LIMITS.SEARCH_QUERY_MAX_CHARS);
    const limit = clampNumber(searchParams.get("limit"), 1, 50, 20);
    if (!q || q.length < 2) {
      return jsonError("Query parameter q must be at least 2 characters", { status: 400, code: "INVALID_QUERY" });
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await Article.find({
      isDuplicate: { $ne: true },
      $or: [{ title: regex }, { summary: regex }, { description: regex }, { sourceName: regex }, { tags: regex }, { category: regex }],
    })
      .sort({ publishedAt: -1 })
      .limit(LIMITS.NEWS_FETCH_MAX)
      .lean();
    const ranked = rankArticles(docs).slice(0, limit);
    return jsonSuccess({ query: q, count: ranked.length, results: ranked.map((d) => toArticleResponse(d)) });
  } catch (error) {
    return jsonFromError(error, { fallbackMessage: "Search unavailable" });
  }
}