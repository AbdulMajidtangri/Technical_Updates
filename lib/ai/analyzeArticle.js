import { getOpenAIClient, getOpenAIModel } from "./openai.js";
import {
  ARTICLE_ANALYSIS_SYSTEM_PROMPT,
  buildArticleAnalysisUserPrompt,
} from "./prompts.js";
import { validateAiResponse } from "./validateAiResponse.js";

/**
 * Analyze one article with OpenAI and validate structured JSON output.
 * @param {object} article
 * @param {{ model?: string, temperature?: number }} [options]
 * @returns {Promise<{ success: true, analysis: object, model: string, usage?: object } | { success: false, error: string, details?: object }>}
 */
export async function analyzeArticle(article, options = {}) {
  if (!article?.title) {
    return { success: false, error: "Article title is required for analysis" };
  }

  const openai = getOpenAIClient();
  const model = options.model ?? getOpenAIModel();

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: options.temperature ?? 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ARTICLE_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildArticleAnalysisUserPrompt(article) },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      return { success: false, error: "OpenAI returned an empty response" };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return {
        success: false,
        error: "OpenAI response was not valid JSON",
        details: { rawContent: rawContent.slice(0, 500) },
      };
    }

    const validated = validateAiResponse(parsed);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error,
        details: { issues: validated.issues, raw: parsed },
      };
    }

    const data = validated.data;

    return {
      success: true,
      analysis: {
        category: data.category,
        tags: data.tags,
        importanceScore: data.importanceScore,
        relevanceScore: data.relevanceScore,
        developerImpact: data.developerImpact,
        summary: data.summary,
        simpleExplanation: data.simpleExplanation,
        whyItMatters: data.whyItMatters,
      },
      model,
      usage: completion.usage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return { success: false, error: message };
  }
}

export default analyzeArticle;