import { z } from "zod";
import { callStructuredAI } from "@/lib/ai/callStructuredAI.js";
import { normalizeConceptName, conceptIdFromName } from "../shared/confidence.js";
import { INTELLIGENCE_CONFIG } from "../shared/config.js";

const conceptsSchema = z.object({
  concepts: z.array(
    z.object({
      name: z.string().min(1).max(120),
      category: z.string().max(80),
      importanceScore: z.number().min(0).max(100),
      articleContext: z.string().max(300),
    }),
  ).max(12),
});

const EXTRACT_PROMPT = `Extract meaningful concepts needed to understand this article.
Skip common words (news, company, today, people, world).
Return JSON: { "concepts": [{ "name", "category", "importanceScore", "articleContext" }] }
importanceScore: how necessary this concept is to understand the article (0-100).`;

export async function extractConcepts(article) {
  const result = await callStructuredAI({
    system: EXTRACT_PROMPT,
    user: JSON.stringify({ title: article.title, content: article.content, category: article.category }),
    schema: conceptsSchema,
    temperature: 0.15,
  });

  if (!result.success) return result;

  const seen = new Map();
  const concepts = [];

  for (const c of result.data.concepts) {
    const normalizedName = normalizeConceptName(c.name);
    if (!normalizedName || normalizedName.length < 2) continue;
    if (seen.has(normalizedName)) continue;
    seen.set(normalizedName, true);

    concepts.push({
      conceptId: conceptIdFromName(c.name),
      name: c.name.trim(),
      normalizedName,
      category: c.category ?? article.category,
      importanceScore: c.importanceScore,
      articleContext: c.articleContext,
    });
  }

  return {
    success: true,
    concepts: concepts.slice(0, INTELLIGENCE_CONFIG.learnPath.maxConceptsExtracted),
    model: result.model,
  };
}

export default extractConcepts;
