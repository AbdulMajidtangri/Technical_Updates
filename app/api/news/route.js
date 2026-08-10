import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";
import { rankArticles } from "@/lib/ranking/rankArticles.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";
import { clampNumber } from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

function buildNewsFilter(searchParams) {
  const filter = { isDuplicate: { $ne: true } };
  const category = searchParams.get("category")?.trim();
  if (category) filter.category = category;
  const source = searchParams.get("source")?.trim();
  if (source) filter.sourceName = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const developerImpact = searchParams.get("developerImpact")?.trim();
  if (developerImpact && ["High", "Medium", "Low"].includes(developerImpact)) {
    filter.developerImpact = developerImpact;
  }
  const importance = searchParams.get("importance");
  if (importance) {
    const min = Number(importance);
    if (Number.isFinite(min)) filter.importanceScore = { $gte: min };
  }
  const dateFrom = searchParams.get("dateFrom") ?? searchParams.get("from");
  const dateTo = searchParams.get("dateTo") ?? searchParams.get("to");
  if (dateFrom || dateTo) {
    filter.publishedAt = {};
    if (dateFrom) filter.publishedAt.$gte = new Date(dateFrom);
    if (dateTo) filter.publishedAt.$lte = new Date(dateTo);
  }
  const analyzed = searchParams.get("analyzed");
  if (analyzed === "true") filter.aiProcessed = true;
  if (analyzed === "false") filter.aiProcessed = false;
  return filter;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = clampNumber(searchParams.get("page"), 1, 10_000, 1);
    const limit = clampNumber(searchParams.get("limit"), 1, LIMITS.NEWS_PAGE_LIMIT_MAX, 20);
    const filter = buildNewsFilter(searchParams);
    const docs = await Article.find(filter)
      .sort({ publishedAt: -1, collectedAt: -1 })
      .limit(LIMITS.NEWS_FETCH_MAX)
      .lean();
    const ranked = rankArticles(docs);
    const total = ranked.length;
    const start = (page - 1) * limit;
    const slice = ranked.slice(start, start + limit);
    return jsonSuccess({
      articles: slice.map((a) => toArticleResponse(a)),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return jsonFromError(error);
  }
}