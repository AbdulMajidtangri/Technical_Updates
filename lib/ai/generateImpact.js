import { callStructuredAI } from "./callStructuredAI.js";
import { impactSchema } from "./schemas/intelligenceSchemas.js";
import { IMPACT_SYSTEM_PROMPT, buildImpactUserPrompt } from "./prompts/impactPrompt.js";
import { getArticleDoc, articleContextForAI } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";

export async function generateImpact(articleId, { force = false } = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  if (!force) {
    const cached = getCachedIntelligence(doc, "impact");
    if (cached) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const context = articleContextForAI(doc);
  const result = await callStructuredAI({
    system: IMPACT_SYSTEM_PROMPT,
    user: buildImpactUserPrompt(context),
    schema: impactSchema,
  });

  if (!result.success) return result;

  await cacheIntelligence(String(doc._id), "impact", result.data, result.model);
  return { success: true, data: result.data, cached: false, model: result.model };
}

export default generateImpact;
