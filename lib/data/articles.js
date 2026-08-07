import { cache } from "react";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { CATEGORIES, CATEGORY_DESCRIPTIONS, getCategorySlug } from "@/lib/config/categories.js";
import { rankArticles } from "@/lib/ranking/rankArticles.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";

function buildFilter(options = {}) {
  const filter = { isDuplicate: { $ne: true } };
  if (options.category) filter.category = options.category;
  if (options.source) {
    filter.sourceName = new RegExp(String(options.source).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  }
  if (options.developerImpact && ["High", "Medium", "Low"].includes(options.developerImpact)) {
    filter.developerImpact = options.developerImpact;
  }
  if (options.importance) {
    const min = Number(options.importance);
    if (Number.isFinite(min)) filter.importanceScore = { $gte: min };
  }
  if (options.dateFrom || options.dateTo) {
    filter.publishedAt = {};
    if (options.dateFrom) filter.publishedAt.$gte = new Date(options.dateFrom);
    if (options.dateTo) filter.publishedAt.$lte = new Date(options.dateTo);
  }
  if (options.analyzed === true) filter.aiProcessed = true;
  if (options.analyzed === false) filter.aiProcessed = false;
  return filter;
}

export async function getArticles(options = {}) {
  await connectDB();
  const page = Math.max(1, Number(options.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(options.limit ?? 20)));
  const filter = buildFilter(options);
  const docs = await Article.find(filter).lean();
  const ranked = rankArticles(docs);
  const total = ranked.length;
  const start = (page - 1) * limit;
  const slice = ranked.slice(start, start + limit);
  return {
    articles: slice.map((a) => toArticleResponse(a)),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function fetchArticleBySlugOrId(key) {
  await connectDB();
  const id = decodeURIComponent(String(key ?? "").trim());
  if (!id) return null;
  let doc = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    doc = await Article.findById(id).lean();
  }
  if (!doc) doc = await Article.findOne({ slug: id }).lean();
  return doc ? toArticleResponse(doc) : null;
}

export const getArticleBySlugOrId = cache(fetchArticleBySlugOrId);

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const getStats = cache(async function getStats() {
  await connectDB();
  const todayStart = startOfTodayUtc();
  const [totalArticles, analyzed, today, important, categoryRows, sourceRows, latest] = await Promise.all([
    Article.countDocuments({ isDuplicate: { $ne: true } }),
    Article.countDocuments({ aiProcessed: true, isDuplicate: { $ne: true } }),
    Article.countDocuments({ isDuplicate: { $ne: true }, $or: [{ publishedAt: { $gte: todayStart } }, { collectedAt: { $gte: todayStart } }] }),
    Article.countDocuments({ isDuplicate: { $ne: true }, importanceScore: { $gte: 75 } }),
    Article.aggregate([{ $match: { isDuplicate: { $ne: true } } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Article.aggregate([{ $match: { isDuplicate: { $ne: true }, sourceName: { $ne: "" } } }, { $group: { _id: "$sourceName", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Article.findOne({ isDuplicate: { $ne: true } }).sort({ updatedAt: -1 }).select("updatedAt").lean(),
  ]);
  return {
    totalArticles,
    articlesAnalyzed: analyzed,
    articlesToday: today,
    importantArticles: important,
    categories: categoryRows.map((r) => ({ category: r._id || "Other", count: r.count })),
    sources: sourceRows.map((r) => ({ source: r._id, count: r.count })),
    lastUpdated: latest?.updatedAt ?? null,
  };
});

export const getCategoriesWithCounts = cache(async function getCategoriesWithCounts() {
  await connectDB();
  const rows = await Article.aggregate([
    { $match: { isDuplicate: { $ne: true } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const countMap = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return CATEGORIES.map((name) => ({
    name,
    slug: getCategorySlug(name),
    description: CATEGORY_DESCRIPTIONS[name] ?? "",
    count: countMap[name] ?? 0,
  }));
});