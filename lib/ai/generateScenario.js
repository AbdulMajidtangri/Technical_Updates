import crypto from "crypto";
import { callStructuredAI } from "./callStructuredAI.js";
import { scenarioSchema } from "./schemas/intelligenceSchemas.js";
import { SCENARIO_SYSTEM_PROMPT, buildScenarioUserPrompt } from "./prompts/scenarioPrompt.js";
import { getArticleDoc, articleContextForAI } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedScenario, cacheScenario } from "@/lib/intelligence/cacheIntelligence.js";
import { findConnectionCandidates } from "@/lib/intelligence/findConnectionCandidates.js";

function hashQuestion(question) {
  return crypto.createHash("sha256").update(question.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export async function generateScenario(articleId, question, { force = false } = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  const q = String(question ?? "").trim();
  if (q.length < 5) return { success: false, error: "Please provide a scenario question (at least 5 characters)" };

  const questionHash = hashQuestion(q);

  if (!force) {
    const cached = getCachedScenario(doc, questionHash);
    if (cached) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const context = articleContextForAI(doc);
  const candidates = await findConnectionCandidates(doc, 5);
  const related = candidates.map((c) => ({
    id: String(c._id),
    title: c.title,
    summary: c.summary,
    category: c.category,
    tags: c.tags,
  }));

  const result = await callStructuredAI({
    system: SCENARIO_SYSTEM_PROMPT,
    user: buildScenarioUserPrompt(context, q, related),
    schema: scenarioSchema,
    temperature: 0.3,
  });

  if (!result.success) return result;

  const data = { ...result.data, question: q };
  await cacheScenario(String(doc._id), questionHash, data, result.model);

  return { success: true, data, cached: false, model: result.model };
}

export default generateScenario;
