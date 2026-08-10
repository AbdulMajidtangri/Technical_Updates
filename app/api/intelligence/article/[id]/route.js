import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { getArticleDoc } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence } from "@/lib/intelligence/cacheIntelligence.js";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const doc = await getArticleDoc(id);
    if (!doc) return jsonError("Article not found", { status: 404 });

    return jsonSuccess({
      articleId: String(doc._id),
      actionPlanner: getCachedIntelligence(doc, "actionPlanner")?.data ?? null,
      learnPath: getCachedIntelligence(doc, "learnPath")?.data ?? null,
      understand: getCachedIntelligence(doc, "understand")?.data ?? null,
      impact: getCachedIntelligence(doc, "impact")?.data ?? null,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}
