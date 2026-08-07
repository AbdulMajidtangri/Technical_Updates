import { callStructuredAI } from "./callStructuredAI.js";
import { learningSchema } from "./schemas/intelligenceSchemas.js";
import { LEARNING_SYSTEM_PROMPT, buildLearningUserPrompt } from "./prompts/learningPrompt.js";
import { getArticleDoc, articleContextForAI } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";
import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";

export async function generateLearning(articleId, { force = false } = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  if (!force) {
    const cached = getCachedIntelligence(doc, "learning");
    if (cached) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const context = articleContextForAI(doc);
  const result = await callStructuredAI({
    system: LEARNING_SYSTEM_PROMPT,
    user: buildLearningUserPrompt(context),
    schema: learningSchema,
  });

  if (!result.success) return result;

  await cacheIntelligence(String(doc._id), "learning", result.data, result.model);

  await connectDB();
  await Article.updateOne({ _id: doc._id }, { $set: { learningData: result.data } });

  return { success: true, data: result.data, cached: false, model: result.model };
}

export default generateLearning;
