import { z } from "zod";
import { callStructuredAI } from "@/lib/ai/callStructuredAI.js";

const explanationSchema = z.object({
  explanation: z.string().min(1).max(800),
  whyItMatters: z.string().min(1).max(500),
  example: z.string().min(1).max(500),
  connection: z.string().max(300).optional().nullable(),
  quiz: z.object({
    question: z.string(),
    options: z.array(z.string()).min(2).max(4),
    correctIndex: z.number().int().min(0),
  }).optional().nullable(),
});

const EXPLANATION_PROMPT = `Write a concise micro-learning card for ONE concept in the context of ONE article.
Use simple language. Keep each field short.
Return JSON with explanation, whyItMatters, example, connection, and optional quiz (multiple choice).`;

/**
 * Generate or retrieve cached micro-explanation for a concept.
 * @param {object} article
 * @param {object} concept
 * @param {Map} explanationCache - in-memory or passed cache
 */
export async function generateMicroExplanation(article, concept, explanationCache = new Map()) {
  const cacheKey = `${concept.normalizedName}:v1`;
  if (explanationCache.has(cacheKey)) {
    return { success: true, data: explanationCache.get(cacheKey), cached: true };
  }

  const result = await callStructuredAI({
    system: EXPLANATION_PROMPT,
    user: JSON.stringify({
      concept: concept.name,
      articleTitle: article.title,
      articleContext: concept.articleContext,
    }),
    schema: explanationSchema,
    temperature: 0.2,
  });

  if (!result.success) return result;

  explanationCache.set(cacheKey, result.data);
  return { success: true, data: result.data, cached: false, model: result.model };
}

export default generateMicroExplanation;
