import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";
import { rankArticles } from "@/lib/ranking/rankArticles.js";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    if (!q || q.length < 2) {
      return jsonError("Query parameter q must be at least 2 characters", { status: 400, code: "INVALID_QUERY" });
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await Article.find({
      isDuplicate: { $ne: true },
      $or: [{ title: regex }, { summary: regex }, { description: regex }, { sourceName: regex }, { tags: regex }, { category: regex }],
    }).lean();
    const ranked = rankArticles(docs).slice(0, limit);
    return jsonSuccess({ query: q, count: ranked.length, results: ranked.map((d) => toArticleResponse(d)) });
  } catch (error) {
    return jsonFromError(error);
  }
}