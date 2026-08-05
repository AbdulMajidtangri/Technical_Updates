import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET() {
  try {
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
    return jsonSuccess({
      totalArticles,
      articlesAnalyzed: analyzed,
      articlesToday: today,
      importantArticles: important,
      categories: categoryRows.map((r) => ({ category: r._id || "Other", count: r.count })),
      sources: sourceRows.map((r) => ({ source: r._id, count: r.count })),
      lastUpdated: latest?.updatedAt ?? null,
    });
  } catch (error) {
    return jsonFromError(error);
  }
}