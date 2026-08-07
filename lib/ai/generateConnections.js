import { callStructuredAI } from "./callStructuredAI.js";
import { connectionSchema } from "./schemas/intelligenceSchemas.js";
import { CONNECTION_SYSTEM_PROMPT, buildConnectionUserPrompt } from "./prompts/connectionPrompt.js";
import { getArticleDoc, articleContextForAI } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";
import { findConnectionCandidates } from "@/lib/intelligence/findConnectionCandidates.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";

export async function generateConnections(articleId, { force = false } = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  if (!force) {
    const cached = getCachedIntelligence(doc, "connections");
    if (cached) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const candidates = await findConnectionCandidates(doc, 8);
  if (!candidates.length) {
    const empty = { connections: [], connectionChain: [] };
    await cacheIntelligence(String(doc._id), "connections", empty, "deterministic");
    return { success: true, data: empty, cached: false, model: "deterministic" };
  }

  const primary = articleContextForAI(doc);
  const candidatePayload = candidates.map((c) => ({
    articleId: String(c._id),
    title: c.title,
    summary: c.summary ?? c.description ?? "",
    category: c.category,
    tags: c.tags ?? [],
    publishedAt: c.publishedAt,
  }));

  const result = await callStructuredAI({
    system: CONNECTION_SYSTEM_PROMPT,
    user: buildConnectionUserPrompt(primary, candidatePayload),
    schema: connectionSchema,
  });

  if (!result.success) {
    const fallback = {
      connections: candidates.slice(0, 5).map((c) => ({
        articleId: String(c._id),
        title: c.title,
        relationshipType: "related topic",
        confidence: "MEDIUM",
        explanation: `Shares tags or category with this article (${(c.tags ?? []).slice(0, 3).join(", ") || c.category}).`,
      })),
      connectionChain: [],
    };
    await cacheIntelligence(String(doc._id), "connections", fallback, "deterministic-fallback");
    return { success: true, data: fallback, cached: false, model: "deterministic-fallback" };
  }

  const enriched = {
    ...result.data,
    connections: result.data.connections.map((conn) => {
      const match = candidates.find((c) => String(c._id) === conn.articleId);
      return {
        ...conn,
        article: match ? toArticleResponse(match) : null,
      };
    }),
  };

  await cacheIntelligence(String(doc._id), "connections", enriched, result.model);
  return { success: true, data: enriched, cached: false, model: result.model };
}

export default generateConnections;
