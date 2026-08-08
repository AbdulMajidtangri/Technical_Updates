import { z } from "zod";
import { callStructuredAI } from "@/lib/ai/callStructuredAI.js";

const eventsSchema = z.object({
  events: z.array(
    z.object({
      eventType: z.string(),
      entity: z.string().optional().nullable(),
      affectedVersion: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
      fact: z.string().min(1).max(500),
    }),
  ).max(8),
});

const EXTRACTION_PROMPT = `Extract factual events from the article. Do NOT recommend actions.
Return JSON: { "events": [{ "eventType", "entity", "affectedVersion", "date", "fact" }] }
Only facts supported by the article. No speculation.`;

export async function extractEvents(article) {
  if (!article.content && !article.summary) {
    return { success: true, events: [], model: "deterministic" };
  }

  const result = await callStructuredAI({
    system: EXTRACTION_PROMPT,
    user: JSON.stringify({ title: article.title, content: article.content, summary: article.summary }),
    schema: eventsSchema,
    temperature: 0.1,
  });

  if (!result.success) return result;
  return { success: true, events: result.data.events, model: result.model };
}

const candidatesSchema = z.object({
  actionRequired: z.boolean(),
  candidates: z.array(
    z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(800),
      reason: z.string().min(1).max(500),
      evidence: z.string().min(1).max(500),
      sourceQuote: z.string().max(300).optional().nullable(),
      targetAudience: z.string().min(1).max(100),
      deadline: z.string().max(100).optional().nullable(),
      explicitness: z.enum(["direct", "implied", "consideration"]),
    }),
  ).max(5),
});

const CANDIDATES_PROMPT = `Generate action CANDIDATES only if the article supports them with evidence.
If no action is needed, return { "actionRequired": false, "candidates": [] }.
Do NOT invent deadlines, statistics, or requirements not in the article.
Use cautious language. Prefer empty candidates over generic advice.
explicitness: direct = stated in article, implied = reasonable direct implication, consideration = optional watch item.`;

export async function generateActionCandidates(article, events, signals, audiences) {
  const result = await callStructuredAI({
    system: CANDIDATES_PROMPT,
    user: JSON.stringify({
      article: { title: article.title, content: article.content, category: article.category },
      events,
      detectedSignals: signals,
      suggestedAudiences: audiences,
    }),
    schema: candidatesSchema,
    temperature: 0.15,
  });

  if (!result.success) return result;
  return { success: true, ...result.data, model: result.model };
}

export default extractEvents;
