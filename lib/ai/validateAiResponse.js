import { z } from "zod";
import { CATEGORIES } from "../config/categories.js";

/** @type {[string, ...string[]]} */
const categoryEnum = /** @type {[string, ...string[]]} */ (CATEGORIES);

export const aiAnalysisSchema = z.object({
  category: z.enum(categoryEnum),
  tags: z.array(z.string().min(1).max(64)).min(1).max(12),
  importanceScore: z.number().int().min(1).max(100),
  relevanceScore: z.number().int().min(1).max(100),
  developerImpact: z.enum(["High", "Medium", "Low"]),
  summary: z.string().min(1).max(2000),
  simpleExplanation: z.string().min(1).max(1000),
  whyItMatters: z.string().min(1).max(1500),
});

/**
 * Parse and validate structured AI output.
 * @param {unknown} payload
 * @returns {{ success: true, data: z.infer<typeof aiAnalysisSchema> } | { success: false, error: string, issues?: object[] }}
 */
export function validateAiResponse(payload) {
  const parsed = aiAnalysisSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: "AI response failed schema validation",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return { success: true, data: parsed.data };
}

export default validateAiResponse;