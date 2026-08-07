import { callStructuredAI } from "./callStructuredAI.js";
import { understandSchema } from "./schemas/intelligenceSchemas.js";
import { UNDERSTAND_SYSTEM_PROMPT, buildUnderstandUserPrompt } from "./prompts/understandPrompt.js";
import { getArticleDoc, articleContextForAI } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";
import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";

export async function generateUnderstand(articleId, { force = false } = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  if (!force) {
    const cached = getCachedIntelligence(doc, "understand");
    if (cached) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const context = articleContextForAI(doc);
  const result = await callStructuredAI({
    system: UNDERSTAND_SYSTEM_PROMPT,
    user: buildUnderstandUserPrompt(context),
    schema: understandSchema,
  });

  if (!result.success) return result;

  await cacheIntelligence(String(doc._id), "understand", result.data, result.model);

  await connectDB();
  await Article.updateOne(
    { _id: doc._id },
    {
      $set: {
        whatHappened: result.data.whatHappened,
        keyFacts: result.data.keyFacts,
        unknowns: result.data.unknowns,
        affectedGroups: result.data.affectedGroups,
        simpleExplanation: result.data.simpleExplanation,
        whyItMatters: result.data.whyItMatters,
      },
    },
  );

  return { success: true, data: result.data, cached: false, model: result.model };
}

export default generateUnderstand;
